import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../entity/User';
import { logger } from '../../logger';
import { dbRepo } from '../database/database.service';

@Injectable()
export class NotificationService {
    private readonly firebaseAdmin: admin.app.App;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const firebaseConfig: ServiceAccount = {
            projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
            privateKey: this.configService
                .get<string>('FIREBASE_PRIVATE_KEY')
                .replace(/\\n/g, '\n'),
            clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        };

        this.firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
        });
    }

    async sendNotificationToUser(
        userId: number,
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<void> {
        const user = await dbRepo(User).findOne({ where: { id: userId } });

        if (!user) {
            logger.debug(`User with ID ${userId} not found.`);
            return;
        }

        if (!user.deviceTokens || user.deviceTokens.length === 0) {
            logger.debug(`No device tokens found for user ID ${userId}.`);
            return;
        }

        const message: admin.messaging.MulticastMessage = {
            notification: {
                title,
                body,
            },
            data,
            tokens: user.deviceTokens,
        };

        try {
            const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
            logger.debug(
                `Sent notification to user ID ${userId}. Success: ${response.successCount}, Failure: ${response.failureCount}`,
            );

            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const failedToken = user.deviceTokens[idx];
                        logger.debug(`Failed to send to token: ${failedToken}`);
                        // Optionally, remove the invalid token from the user's deviceTokens
                        // user.deviceTokens = user.deviceTokens.filter(token => token !== failedToken);
                    }
                });
                // await this.userRepository.save(user); // Uncomment if modifying deviceTokens
            }
        } catch (error) {
            logger.error(`Error sending notification to user ID ${userId}:`, error);
        }
    }

    async sendNotificationToUsers(
        userIds: number[],
        title: string,
        body: string,
        data?: Record<string, string>,
    ): Promise<void> {
        const users = await dbRepo(User).find({
            where: { id: In(userIds) },
        });

        const tokens = users.flatMap(user => user.deviceTokens || []);

        if (tokens.length === 0) {
            logger.debug('No device tokens found for the specified users.');
            return;
        }

        const message: admin.messaging.MulticastMessage = {
            notification: {
                title,
                body,
            },
            data,
            tokens,
        };

        try {
            const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
            logger.debug(
                `Sent notification to ${tokens.length} devices. Success: ${response.successCount}, Failure: ${response.failureCount}`,
            );
            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const failedToken = tokens[idx];
                        logger.debug(`Failed to send to token: ${failedToken}`);
                    }
                });
            }
        } catch (error) {
            logger.error('Error sending notifications:', error);
        }
    }
}
