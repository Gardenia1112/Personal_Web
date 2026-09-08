using System;
using System.Collections.Generic;
using UnityEngine;

public class ExpSys : MonoBehaviour
{
    public static ExpSys Instance;

    [Header("经验系统配置")]
    public int currentLevel = 1; 
    public int currentExp = 0;
    public int totalExpEarned = 0;

    [System.Serializable]
    public class LevelData
    {
        public int level;
        public int expRequired;
        public UnlockableContent[] unlocks;
    }

    [System.Serializable]
    public class UnlockableContent
    {
        public string contentId;
        public ContentType type;
        public string displayName;
        public string description;
    }

    [System.Serializable]
    public class StarterReward
    {
        public RewardType type;
        public string itemId;
        public int amount;
        public string description;
    }

    public enum ContentType
    {
        Skill,
        Weapon,
        GameMode,
        SystemFeature,
        LevelAccess,
        ShopItem
    }

    public enum RewardType
    {
        Skill,
        Weapon,
        Currency,
        Consumable,
        Equipment
    }

    [Header("经验获取配置")]
    public int expPerKill = 5;
    public int expPerSpecialKill = 25;
    public int expPerFlowWave = 10;
    public int expPerFanMilestone = 20;
    public int expPerStylishMove = 3;
    public float fansToExpRatio = 0.1f; // 每10粉丝换1经验（测试用数值）

    [Header("等级配置")]
    public LevelData[] levelData = {
        new LevelData {
            level = 1,
            expRequired = 0,
            unlocks = new UnlockableContent[] {
                new UnlockableContent {
                    contentId = "double_jump",
                    type = ContentType.Skill,
                    displayName = "二段跳",
                    description = "解锁二段跳能力"
                },
                new UnlockableContent {
                    contentId = "starter_pistol",
                    type = ContentType.Weapon,
                    displayName = "新手手枪",
                    description = "获得基础武器"
                },
                new UnlockableContent {
                    contentId = "main_menu",
                    type = ContentType.SystemFeature,
                    displayName = "主菜单",
                    description = "解锁主菜单界面"
                }
            }
        },
        new LevelData {
            level = 2,
            expRequired = 100,
            unlocks = new UnlockableContent[] {
                new UnlockableContent {
                    contentId = "dash_ability",
                    type = ContentType.Skill,
                    displayName = "冲刺",
                    description = "解锁冲刺能力"
                },
                new UnlockableContent {
                    contentId = "shop_access",
                    type = ContentType.SystemFeature,
                    displayName = "商店",
                    description = "解锁商店功能"
                }
            }
        },
        new LevelData {
            level = 3,
            expRequired = 300,
            unlocks = new UnlockableContent[] {
                new UnlockableContent {
                    contentId = "level_2",
                    type = ContentType.LevelAccess,
                    displayName = "第二关",
                    description = "解锁第二关卡"
                }
            }
        }
    };

    [Header("新手教程奖励")]
    public StarterReward[] tutorialRewards = {
        new StarterReward {
            type = RewardType.Skill,
            itemId = "double_jump",
            description = "二段跳技能"
        },
        new StarterReward {
            type = RewardType.Weapon,
            itemId = "starter_pistol",
            description = "新手手枪"
        },
        new StarterReward {
            type = RewardType.Currency,
            amount = 100,
            description = "100金币"
        },
        new StarterReward {
            type = RewardType.Consumable,
            itemId = "health_potion",
            amount = 3,
            description = "医疗包 x3"
        }
    };

    public event Action<int> OnLevelUp;
    public event Action<int, int> OnExpChanged; 
    public event Action<UnlockableContent> OnContentUnlocked;
    private Dictionary<int, LevelData> levelDataDict = new Dictionary<int, LevelData>();
    private Dictionary<string, bool> unlockedContent = new Dictionary<string, bool>();

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
            return;
        }

        InitializeExpSystem();
    }

    private void InitializeExpSystem()
    {
        levelDataDict.Clear();
        foreach (var data in levelData)
        {
            levelDataDict[data.level] = data;
        }

        unlockedContent.Clear();
        currentLevel = 1; 
        currentExp = 0;
        UnlockLevelContent(1);

        OnExpChanged?.Invoke(currentExp, GetExpRequiredForNextLevel());

    }
    public void AddExp(int amount, string source = "default")
    {
        if (currentLevel >= GetMaxLevel())
        {
            currentExp = GetExpRequiredForLevel(GetMaxLevel());
            OnExpChanged?.Invoke(currentExp, GetExpRequiredForNextLevel());
            return;
        }

        int oldExp = currentExp;
        currentExp += amount;
        totalExpEarned += amount;

        OnExpChanged?.Invoke(currentExp, GetExpRequiredForNextLevel());
        GameEvents.TriggerPlayerExpChanged(currentExp, GetExpRequiredForNextLevel());
        CheckLevelUp(oldExp);
    }

    public void AddExpFromKill(bool isSpecial = false)
    {
        int expAmount = isSpecial ? expPerSpecialKill : expPerKill;
        AddExp(expAmount, isSpecial ? "special_kill" : "kill");
    }

    public void AddExpFromFans(int fansAmount)
    {
        int expAmount = Mathf.RoundToInt(fansAmount * fansToExpRatio);
        if (expAmount > 0)
        {
            AddExp(expAmount, "fans");
        }
    }

    public void AddExpFromFlowWave()
    {
        AddExp(expPerFlowWave, "flow_wave");
    }

    public void AddExpFromStylishMove()
    {
        AddExp(expPerStylishMove, "stylish_move");
    }

    public void AddExpFromFansMilestone()
    {
        AddExp(expPerFanMilestone, "fan_milestone");
    }

    private void CheckLevelUp(int oldExp)
    {
        while (currentLevel < GetMaxLevel() && currentExp >= GetExpRequiredForNextLevel())
        {
            LevelUp();
        }
    }

    private void LevelUp()
    {
        currentLevel++;
        UnlockLevelContent(currentLevel);
        OnLevelUp?.Invoke(currentLevel);
        GameEvents.TriggerPlayerLevelUp(currentLevel);
        if (currentLevel < GetMaxLevel() && currentExp >= GetExpRequiredForNextLevel())
        {
            CheckLevelUp(0);
        }
    }

    private void UnlockLevelContent(int level)
    {
        if (levelDataDict.ContainsKey(level))
        {
            var levelUnlocks = levelDataDict[level].unlocks;
            foreach (var content in levelUnlocks)
            {
                if (!unlockedContent.ContainsKey(content.contentId))
                {
                    unlockedContent[content.contentId] = true;
                    OnContentUnlocked?.Invoke(content);
                    GameEvents.TriggerContentUnlocked(content.contentId);
                    ApplyUnlockedContent(content);
                }
            }
        }
    }
    private void ApplyUnlockedContent(UnlockableContent content)
    {
        // 这里可以根据内容类型调用相应的系统
        // 例如：解锁技能、武器、系统功能等
        switch (content.type)
        {
            case ContentType.Skill:
                SkillManager.Instance?.UnlockSkill(content.contentId);
                break;
            case ContentType.Weapon:
                InventorySys.Instance?.AddWeapon(content.contentId);
                break;
            case ContentType.SystemFeature:
                GameProgressManager.Instance?.UnlockSystemFeature(content.contentId);
                break;
            case ContentType.LevelAccess:
                LevelManager.Instance?.UnlockLevel(content.contentId);
                break;
        }
    }

    public void ForceLevelUp(int targetLevel)
    {
        if (targetLevel > currentLevel)
        {
            for (int i = currentLevel + 1; i <= targetLevel; i++)
            {
                currentLevel = i;
                UnlockLevelContent(i);
                OnLevelUp?.Invoke(currentLevel);
            }
            currentExp = GetExpRequiredForLevel(targetLevel);
            OnExpChanged?.Invoke(currentExp, GetExpRequiredForNextLevel());
        }
    }

    public void CompleteTutorial()
    {
        foreach (var reward in tutorialRewards)
        {
            GrantStarterReward(reward);
        }
        ForceLevelUp(1);
        GameEvents.TriggerTutorialCompleted();
    }

    private void GrantStarterReward(StarterReward reward)
    {
        switch (reward.type)
        {
            case RewardType.Skill:
                SkillManager.Instance?.UnlockSkill(reward.itemId);
                break;
            case RewardType.Weapon:
                InventorySys.Instance?.AddWeapon(reward.itemId);
                break;
            case RewardType.Currency:
                CurrencySys.Instance?.AddCurrency(reward.amount);
                break;
            case RewardType.Consumable:
                InventorySys.Instance?.AddItem(reward.itemId, reward.amount);
                break;
            case RewardType.Equipment:
                EquipmentSys.Instance?.UnlockEquipment(reward.itemId);
                break;
        }
    }

    // 工具方法
    public int GetExpRequiredForNextLevel()
    {
        return GetExpRequiredForLevel(currentLevel + 1);
    }

    public int GetExpRequiredForLevel(int level)
    {
        if (level <= 1) return 0; 

        if (levelDataDict.ContainsKey(level))
        {
            return levelDataDict[level].expRequired;
        }
        return int.MaxValue; 
    }

    public int GetMaxLevel()
    {
        return levelData.Length;
    }

    public bool IsContentUnlocked(string contentId)
    {
        return unlockedContent.ContainsKey(contentId) && unlockedContent[contentId];
    }

    public float GetExpProgress()
    {
        if (currentLevel >= GetMaxLevel()) return 1f;

        int currentLevelExp = GetExpRequiredForLevel(currentLevel);
        int nextLevelExp = GetExpRequiredForNextLevel();

        if (nextLevelExp <= currentLevelExp) return 1f;

        return Mathf.Clamp01((float)(currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp));
    }

    public void ResetExp()
    {
        currentLevel = 1; 
        currentExp = 0;
        unlockedContent.Clear();
        UnlockLevelContent(1);
        OnExpChanged?.Invoke(currentExp, GetExpRequiredForNextLevel());
    }

    public string GetLevelInfo()
    {
        return $"等级: {currentLevel}, 经验: {currentExp}/{GetExpRequiredForNextLevel()}";
    }
    public bool HasReachedLevel(int level)
    {
        return currentLevel >= level;
    }
}
