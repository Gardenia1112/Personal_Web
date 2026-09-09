using System.Collections.Generic;
using UnityEngine;

public class UpgradeSys : MonoBehaviour
{
    public static UpgradeSys Instance;

    [System.Serializable]
    public class UpgradeEffect
    {
        public UpgradeType type;
        public float value;
        public string displayName;
        public string description;
    }

    [System.Serializable]
    public class UpgradeOption
    {
        public string name;
        public string description;
        public UpgradeType type;
        public float value;
        public UpgradeRarity rarity;
    }

    public enum UpgradeType
    {
        HealthBoost,
        DamageBoost,
        MoveSpeed,
        JumpHeight,
        SpecialAbility,
        FanGain,
        FlowGain
    }

    public enum UpgradeRarity
    {
        Common,
        Rare,
        Epic,
        Legendary
    }

    private Dictionary<UpgradeType, float> activeUpgrades = new Dictionary<UpgradeType, float>();
    private List<UpgradeOption> currentSelection = new List<UpgradeOption>();

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }

    public List<UpgradeOption> GenerateUpgradeOptions(int count)
    {
        List<UpgradeOption> allOptions = new List<UpgradeOption>
        {
            new UpgradeOption {
                name = "血量增强",
                description = "最大生命值提升20%",
                type = UpgradeType.HealthBoost,
                value = 0.2f,
                rarity = UpgradeRarity.Common
            },
            new UpgradeOption {
                name = "伤害提升",
                description = "攻击伤害提升25%",
                type = UpgradeType.DamageBoost,
                value = 0.25f,
                rarity = UpgradeRarity.Common
            },
            new UpgradeOption {
                name = "移速提升",
                description = "移动速度提升15%",
                type = UpgradeType.MoveSpeed,
                value = 0.15f,
                rarity = UpgradeRarity.Common
            },
            new UpgradeOption {
                name = "跳跃增强",
                description = "跳跃高度提升20%",
                type = UpgradeType.JumpHeight,
                value = 0.2f,
                rarity = UpgradeRarity.Common
            },
            new UpgradeOption {
                name = "弹幕护体",
                description = "周期性发射保护性弹幕",
                type = UpgradeType.SpecialAbility,
                value = 1f,
                rarity = UpgradeRarity.Rare
            },
            new UpgradeOption {
                name = "鬼畜攻击",
                description = "攻击时有几率触发连续打击",
                type = UpgradeType.SpecialAbility,
                value = 1f,
                rarity = UpgradeRarity.Rare
            },
            new UpgradeOption {
                name = "热点追击",
                description = "自动追踪最近的热点敌人",
                type = UpgradeType.SpecialAbility,
                value = 1f,
                rarity = UpgradeRarity.Rare
            }
        };

        List<UpgradeOption> selected = new List<UpgradeOption>();
        List<UpgradeOption> available = new List<UpgradeOption>(allOptions);

        for (int i = 0; i < count && available.Count > 0; i++)
        {
            int randomIndex = Random.Range(0, available.Count);
            selected.Add(available[randomIndex]);
            available.RemoveAt(randomIndex);
        }

        currentSelection = selected;
        return selected;
    }

    public void ApplyUpgrade(UpgradeOption upgrade)
    {
        if (activeUpgrades.ContainsKey(upgrade.type))
        {
            activeUpgrades[upgrade.type] += upgrade.value;
        }
        else
        {
            activeUpgrades[upgrade.type] = upgrade.value;
        }
        ExecuteUpgradeEffect(upgrade);
    }

    private void ExecuteUpgradeEffect(UpgradeOption upgrade)
    {
        switch (upgrade.type)
        {
            case UpgradeType.HealthBoost:
                var hpController = FindObjectOfType<PlayerHPController>();
                if (hpController != null)
                {
                    float oldMaxHP = hpController.maxHP;
                    float increase = Mathf.RoundToInt(hpController.maxHP * upgrade.value);
                    hpController.IncreaseMaxHPTem(increase);
                    GameEvents.TriggerPlayerStatChanged("maxHealth", oldMaxHP, hpController.maxHP);
                }
                break;

            case UpgradeType.DamageBoost:
                var shootAbility = FindObjectOfType<ShootATK>();
                if (shootAbility != null)
                {
                    float oldDamage = shootAbility.damage;
                    shootAbility.damage = Mathf.RoundToInt(shootAbility.damage * (1 + upgrade.value));
                    GameEvents.TriggerPlayerStatChanged("damage", oldDamage, shootAbility.damage);
                }
                break;

            case UpgradeType.MoveSpeed:
            var moveAbility = FindObjectOfType<Ability_Move>();
            if (moveAbility != null && moveAbility.core != null)
            {
                float oldSpeed = moveAbility.core.defaultControllerParams.MoveSpeed;
                moveAbility.core.defaultControllerParams.MoveSpeed *= (1 + upgrade.value);
                float newSpeed = moveAbility.core.defaultControllerParams.MoveSpeed;
                GameEvents.TriggerPlayerStatChanged("moveSpeed", oldSpeed, newSpeed);
            }
            break;

        case UpgradeType.JumpHeight:
            var jumpAbility = FindObjectOfType<Ability_Jump>();
            if (jumpAbility != null)
            {
                float oldJumpHeight = jumpAbility.JumpHeight;
                jumpAbility.JumpHeight *= (1 + upgrade.value);
                float newJumpHeight = jumpAbility.JumpHeight;
                GameEvents.TriggerPlayerStatChanged("jumpHeight", oldJumpHeight, newJumpHeight);
            }
            break;

            case UpgradeType.SpecialAbility:
                ActivateSpecialAbility(upgrade.name);
                GameEvents.TriggerContentUnlocked(upgrade.name);
                break;
        }
    }

    private void ActivateSpecialAbility(string abilityName)
    {
        switch (abilityName)
        {
            case "弹幕护体":
                // 创建弹幕护体效果
                break;
            case "鬼畜攻击":
                // 创建鬼畜攻击效果  
                break;
            case "热点追击":
                // 创建热点追击效果
                break;
        }
    }

    public float GetUpgradeMultiplier(UpgradeType type)
    {
        return activeUpgrades.ContainsKey(type) ? activeUpgrades[type] : 0f;
    }

    public void SelectUpgradeByIndex(int index)
    {
        if (index >= 0 && index < currentSelection.Count)
        {
            ApplyUpgrade(currentSelection[index]);
            currentSelection.Clear();
        }
    }

    public void ClearActiveUpgrades()
    {
        activeUpgrades.Clear();
    }
}