import { Module } from '@nestjs/common/decorators';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { Booking } from 'src/entity/booking.entity';
import { SavedAddress } from 'src/entity/saved-address.entity';
import { AgentProfile } from 'src/entity/agent-profile.entity';
import { Review } from 'src/entity/review.entity';
import { AgentDocument } from 'src/entity/agent-document.entity';
import { Payment } from 'src/entity/payment.entity';
import { SendPackage } from 'src/entity/send-package.entity';
import { BuyFromStore } from 'src/entity/buy-from-store.entity';
import { CarTowing } from 'src/entity/car-towing.entity';
import { Location } from 'src/entity/location.entity';
import { BookingImage } from 'src/entity/booking-image.entity';
import { BookingItem } from 'src/entity/booking-item.entity';
import { RequiredDoc } from 'src/entity/required-doc.entity';
import { Store } from 'src/entity/store.entity';
import { StoreItem } from 'src/entity/store-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      AgentDocument,
      AgentProfile,
      Booking,
      BookingImage,
      BookingItem,
      BuyFromStore,
      CarTowing,
      Location,
      Payment,
      RequiredDoc,
      Review,
      SavedAddress,
      SendPackage,
      Store,
      StoreItem,
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [TypeOrmModule],
})
export class UserModule {}
