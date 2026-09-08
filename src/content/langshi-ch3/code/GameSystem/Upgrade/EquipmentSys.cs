using System.Collections.Generic;
using UnityEngine;

public class EquipmentSys : MonoBehaviour
{
    public static EquipmentSys Instance;

    [System.Serializable]
    public class EquipmentSlot
    {
        public string slotType;
        public string equippedItemId;
    }

    public List<EquipmentSlot> equipmentSlots = new List<EquipmentSlot>();
    public List<string> unlockedEquipment = new List<string>();

    public event System.Action<string> OnEquipmentChanged;
    public event System.Action<string> OnEquipmentUnlocked;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeEquipmentSlots();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeEquipmentSlots()
    {
        equipmentSlots = new List<EquipmentSlot>
        {
            new EquipmentSlot { slotType = "weapon" },
            new EquipmentSlot { slotType = "armor" },
            new EquipmentSlot { slotType = "accessory" }
        };
    }

    public void UnlockEquipment(string equipmentId)
    {
        if (!unlockedEquipment.Contains(equipmentId))
        {
            unlockedEquipment.Add(equipmentId);
            OnEquipmentUnlocked?.Invoke(equipmentId);
            GameEvents.TriggerContentUnlocked(equipmentId);
        }
    }

    public bool EquipItem(string itemId, string slotType)
    {
        var slot = equipmentSlots.Find(s => s.slotType == slotType);
        if (slot != null && unlockedEquipment.Contains(itemId))
        {
            slot.equippedItemId = itemId;
            OnEquipmentChanged?.Invoke(slotType);
            return true;
        }
        return false;
    }

    public void UnequipItem(string slotType)
    {
        var slot = equipmentSlots.Find(s => s.slotType == slotType);
        if (slot != null)
        {
            slot.equippedItemId = null;
            OnEquipmentChanged?.Invoke(slotType);
        }
    }

    public string GetEquippedItem(string slotType)
    {
        var slot = equipmentSlots.Find(s => s.slotType == slotType);
        return slot?.equippedItemId;
    }

    public void ResetEquipment()
    {
        unlockedEquipment.Clear();
        foreach (var slot in equipmentSlots)
        {
            slot.equippedItemId = null;
        }
    }
}