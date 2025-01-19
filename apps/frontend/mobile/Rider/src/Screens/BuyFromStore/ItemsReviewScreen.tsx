import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextStyle,
} from 'react-native';
import {colors} from '../../theme/colors';
import {typography} from '../../theme/typography';
import BottomModal from '../../components/Modals/BottomModal';
import CountdownTimer from '../../components/CountdownTimer';

interface Item {
  id: string;
  name: string;
  quantity: number;
  image: string;
}

const ItemCard: React.FC<{
  item: Item;
  onOutOfStockPress: () => void;
}> = ({item, onOutOfStockPress}) => {
  return (
    <View style={styles.cardContainer}>
      <Image source={{uri: item.image}} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
      <TouchableOpacity
        style={styles.fullWidthAvailableButton}
        onPress={() => console.log('Marked Available')}>
        <Text style={styles.buttonText}>Available</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.fullWidthOutOfStockButton}
        onPress={onOutOfStockPress}>
        <Text style={styles.buttonText}>Out Of Stock</Text>
      </TouchableOpacity>
    </View>
  );
};

const ItemReviewScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'Pending' | 'Approved' | 'Rejected'
  >('Pending');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [items] = useState<Item[]>([
    {
      id: '1',
      name: 'Brown Bread',
      quantity: 2,
      image: 'https://m.media-amazon.com/images/I/71zLJqDIGTL.jpg',
    },
    {
      id: '2',
      name: 'Brown Bread',
      quantity: 2,
      image: 'https://m.media-amazon.com/images/I/71zLJqDIGTL.jpg',
    },
  ]);

  const tabCounts: Record<'Pending' | 'Approved' | 'Rejected', number> = {
    Pending: items.length,
    Approved: 2,
    Rejected: 0,
  };

  const renderItem = ({item}: {item: Item}) => (
    <ItemCard item={item} onOutOfStockPress={() => setIsModalVisible(true)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <CountdownTimer initialSeconds={60} />
          <Text style={styles.headerStatus}>
            Waiting for customer confirmation...
          </Text>
          <View style={styles.headerIconsContainer}>
            <TouchableOpacity>
              <Image
                source={{uri: 'https://via.placeholder.com/24'}}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image
                source={{uri: 'https://via.placeholder.com/24'}}
                style={styles.headerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['Pending', 'Approved', 'Rejected'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() =>
              setActiveTab(tab as 'Pending' | 'Approved' | 'Rejected')
            }>
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
              {tabCounts[tab as 'Pending' | 'Approved' | 'Rejected'] > 0
                ? `${tab} (${tabCounts[tab as 'Pending' | 'Approved' | 'Rejected']})`
                : tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items List */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />

      {/* Footer Button */}
      <TouchableOpacity style={styles.footerButton}>
        <Text style={styles.footerButtonText}>Order Verified</Text>
      </TouchableOpacity>

      {/* Out Of Stock Modal */}
      <BottomModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.white},
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerStatus: {
    flex: 1,
    marginLeft: 10,
    fontSize: typography.fontSize.medium,
    color: colors.text.primaryGrey,
    fontWeight: '500',
  },
  headerIconsContainer: {flexDirection: 'row', gap: 10},
  headerIcon: {width: 24, height: 24},
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.border.primary,
  },
  activeTab: {borderBottomColor: colors.purple},
  tabText: {fontSize: typography.fontSize.medium, color: colors.text.primary},
  activeTabText: {color: colors.purple},
  listContainer: {padding: 10},
  cardContainer: {
    flex: 1,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.primary,
    alignItems: 'center',
  },
  itemImage: {width: 80, height: 80, marginBottom: 10},
  itemName: {
    fontSize: typography.fontSize.medium,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 5,
  },
  itemQuantity: {
    fontSize: typography.fontSize.small,
    color: colors.text.primaryGrey,
    marginBottom: 10,
  },
  fullWidthAvailableButton: {
    backgroundColor: colors.green,
    paddingVertical: 10,
    borderRadius: 5,
    width: '100%',
    marginBottom: 5,
    alignItems: 'center',
  },
  fullWidthOutOfStockButton: {
    backgroundColor: colors.error,
    paddingVertical: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {color: colors.white, fontSize: typography.fontSize.medium},
  footerButton: {
    backgroundColor: colors.purple,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 20,
  },
  footerButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.medium,
    fontWeight: typography.fontWeight.bold as TextStyle['fontWeight'],
  },
});

export default ItemReviewScreen;
