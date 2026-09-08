using System;
using System.Collections.Generic;
using UnityEngine;

public class InventorySys : MonoBehaviour
{
    public static InventorySys Instance;

    [System.Serializable]
    public class InventoryItem
    {
        public string itemId;
        public string itemName;
        public string description;
        public int quantity;
        public ItemType type;
        public Sprite icon;
        public bool isEquipped = false;
    }

    [System.Serializable]
    public class WeaponItem : InventoryItem
    {
        public int damage;
        public float fireRate;
        public string weaponPrefabPath;
    }

    [System.Serializable]
    public class ConsumableItem : InventoryItem
    {
        public int healAmount;
        public float duration;
    }

    [Header("库存配置")]
    public List<InventoryItem> inventoryItems = new List<InventoryItem>();
    public int maxInventorySlots = 20;

    [Header("初始物品")]
    public string[] startingWeapons = { "starter_pistol" };
    public string[] startingItems = { "health_potion" };

    public event Action<InventoryItem> OnItemAdded;
    public event Action<InventoryItem> OnItemRemoved;
    public event Action<InventoryItem> OnItemEquipped;
    public event Action<InventoryItem> OnItemUsed;

    private Dictionary<string, InventoryItem> itemDictionary = new Dictionary<string, InventoryItem>();

    public enum ItemType
    {
        Weapon,
        Consumable,
        Material,
        Special
    }

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeInventory();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeInventory()
    {
        itemDictionary.Clear();
        foreach (var weaponId in startingWeapons)
        {
            AddWeapon(weaponId);
        }

        foreach (var itemId in startingItems)
        {
            AddItem(itemId, 1);
        }
    }

    public void AddItem(string itemId, int quantity = 1)
    {
        InventoryItem item = GetOrCreateItem(itemId);

        if (item != null)
        {
            item.quantity += quantity;
            OnItemAdded?.Invoke(item);

        }
    }
    public void AddWeapon(string weaponId)
    {
        WeaponItem weapon = CreateWeaponItem(weaponId);
        if (weapon != null)
        {
            if (itemDictionary.ContainsKey(weaponId))
            {
                itemDictionary[weaponId].quantity++;
            }
            else
            {
                inventoryItems.Add(weapon);
                itemDictionary[weaponId] = weapon;
            }

            OnItemAdded?.Invoke(weapon);
        }
    }
    public bool UseItem(string itemId)
    {
        if (!itemDictionary.ContainsKey(itemId)) return false;

        var item = itemDictionary[itemId];

        if (item.quantity <= 0) return false;

        bool used = ExecuteItemEffect(item);

        if (used)
        {
            item.quantity--;
            OnItemUsed?.Invoke(item);

            if (item.quantity <= 0)
            {
                RemoveItem(itemId);
            }
        }

        return used;
    }
    public void RemoveItem(string itemId)
    {
        if (itemDictionary.ContainsKey(itemId))
        {
            var item = itemDictionary[itemId];
            inventoryItems.Remove(item);
            itemDictionary.Remove(itemId);

            OnItemRemoved?.Invoke(item);
        }
    }

    public void EquipItem(string itemId)
    {
        if (!itemDictionary.ContainsKey(itemId)) return;

        var item = itemDictionary[itemId];

        if (item.type == ItemType.Weapon)
        {
            foreach (var invItem in inventoryItems)
            {
                if (invItem.type == ItemType.Weapon)
                {
                    invItem.isEquipped = false;
                }
            }

            item.isEquipped = true;
            OnItemEquipped?.Invoke(item);
        }
    }
    private bool ExecuteItemEffect(InventoryItem item)
    {
        switch (item.type)
        {
            case ItemType.Consumable:
                var consumable = item as ConsumableItem;
                if (consumable != null)
                {
                    var playerHP = FindObjectOfType<PlayerHPController>();
                    if (playerHP != null)
                    {
                        playerHP.Heal(consumable.healAmount);
                        return true;
                    }
                }
                break;

            case ItemType.Weapon:
                return false;

            default:
                return true;
        }

        return false;
    }

    private InventoryItem GetOrCreateItem(string itemId)
    {
        if (itemDictionary.ContainsKey(itemId))
        {
            return itemDictionary[itemId];
        }

        InventoryItem newItem = CreateItemFromId(itemId);
        if (newItem != null)
        {
            inventoryItems.Add(newItem);
            itemDictionary[itemId] = newItem;
        }

        return newItem;
    }
    private InventoryItem CreateItemFromId(string itemId)
    {
        // 这里可以根据物品ID返回相应的物品数据
        // 实际项目中可以从配置表或ScriptableObject加载

        switch (itemId)
        {
            case "health_potion":
                return new ConsumableItem
                {
                    itemId = "health_potion",
                    itemName = "治疗药水",
                    description = "恢复50点生命值",
                    type = ItemType.Consumable,
                    healAmount = 50
                };

            case "special_token":
                return new InventoryItem
                {
                    itemId = "special_token",
                    itemName = "特殊代币",
                    description = "用于兑换稀有物品",
                    type = ItemType.Special
                };

            default:
                return new InventoryItem
                {
                    itemId = itemId,
                    itemName = itemId,
                    description = "未知物品",
                    type = ItemType.Material
                };
        }
    }
    private WeaponItem CreateWeaponItem(string weaponId)
    {
        switch (weaponId)
        {
            case "starter_pistol":
                return new WeaponItem
                {
                    itemId = "starter_pistol",
                    itemName = "新手手枪",
                    description = "基础武器，适合新手使用",
                    type = ItemType.Weapon,
                    damage = 10,
                    fireRate = 1.0f
                };

            default:
                return new WeaponItem
                {
                    itemId = weaponId,
                    itemName = weaponId,
                    description = "未知武器",
                    type = ItemType.Weapon,
                    damage = 5,
                    fireRate = 1.0f
                };
        }
    }
    public bool HasItem(string itemId)
    {
        return itemDictionary.ContainsKey(itemId) && itemDictionary[itemId].quantity > 0;
    }
    public int GetItemQuantity(string itemId)
    {
        if (itemDictionary.ContainsKey(itemId))
        {
            return itemDictionary[itemId].quantity;
        }
        return 0;
    }
    public WeaponItem GetEquippedWeapon()
    {
        foreach (var item in inventoryItems)
        {
            if (item.type == ItemType.Weapon && item.isEquipped)
            {
                return item as WeaponItem;
            }
        }
        return null;
    }
    public void ResetInventory()
    {
        inventoryItems.Clear();
        itemDictionary.Clear();
        InitializeInventory();
    }
}
