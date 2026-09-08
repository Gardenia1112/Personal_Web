using System;
using UnityEngine;
using System.Collections.Generic;

public class FansSys : MonoBehaviour
{
    public static FansSys Instance;

    [Header("粉丝系统配置")]
    [SerializeField] private int currentFans = 0;
    [SerializeField] private int totalFansEarned = 0;

    [Header("粉丝阶段配置")]
    public FanStage[] fanStages = {
        new FanStage { stageName = "元老级粉丝", fansRequired = 1,
            rewards = new StageReward[] {
                new StageReward { type = RewardType.Currency, amount = 100, description = "基础金币" },
                new StageReward { type = RewardType.Exp, amount = 50, description = "少量经验" },
                new StageReward { type = RewardType.Item, itemId = "special_token", amount = 1, description = "免费特殊道具" }
            }},
        new FanStage { stageName = "小有名气", fansRequired = 50,
            rewards = new StageReward[] {
                new StageReward { type = RewardType.Currency, amount = 500, description = "中等金币" },
                new StageReward { type = RewardType.UnlockContent, contentId = "shop_access", description = "解锁商店" }
            }},
        new FanStage { stageName = "网络红人", fansRequired = 200,
            rewards = new StageReward[] {
                new StageReward { type = RewardType.UnlockContent, contentId = "mission_system", description = "解锁任务系统" },
                new StageReward { type = RewardType.UnlockContent, contentId = "hard_level_1", description = "解锁困难关卡1" }
            }},
        new FanStage { stageName = "超级明星", fansRequired = 1000,
            rewards = new StageReward[] {
                new StageReward { type = RewardType.UnlockContent, contentId = "training_ground", description = "解锁训练场" },
                new StageReward { type = RewardType.UnlockContent, contentId = "expert_levels", description = "解锁专家关卡" }
            }}
    };

    [Header("粉丝获取配置")]
    public int minFansPerAction = 1;
    public int maxFansPerAction = 5;
    public float stylishMoveFanChance = 0.3f;
    public float killFanChance = 0.1f;
    public float specialKillFanChance = 0.5f;

    public event Action<int> OnFansChanged;
    public event Action<FanStage> OnFanStageReached;
    public event Action<string> OnAchievementUnlocked;

    private int currentStageIndex = 0;
    private bool[] stageAchieved;

    [System.Serializable]
    public class FanStage
    {
        public string stageName;
        public int fansRequired;
        public StageReward[] rewards;
    }

    [System.Serializable]
    public class StageReward
    {
        public RewardType type;
        public string itemId;
        public int amount;
        public string description;
        public string contentId;
    }

    public enum RewardType
    {
        Currency,
        Exp,
        Item,
        UnlockContent
    }

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeFansSystem();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeFansSystem()
    {
        stageAchieved = new bool[fanStages.Length];
        CheckStageProgress();
    }

    public void AddFans(int amount, string source = "default")
    {
        if (amount <= 0) return;

        int actualAmount = Mathf.Clamp(amount, minFansPerAction, maxFansPerAction);

        int oldFans = currentFans;
        currentFans += actualAmount;
        totalFansEarned += actualAmount;

        OnFansChanged?.Invoke(currentFans);
        GameEvents.TriggerFansChanged(currentFans);
        CheckAchievements(oldFans);
        CheckStageProgress();
    }

    public void TryAddFansFromStylishMove()
    {
        if (UnityEngine.Random.value <= stylishMoveFanChance)
        {
            int fansAmount = UnityEngine.Random.Range(minFansPerAction, maxFansPerAction + 1);
            AddFans(fansAmount, "stylish_move");
        }
    }

    public void TryAddFansFromKill(bool isSpecial = false)
    {
        float chance = isSpecial ? specialKillFanChance : killFanChance;
        if (UnityEngine.Random.value <= chance)
        {
            int fansAmount = UnityEngine.Random.Range(minFansPerAction, maxFansPerAction + 1);
            AddFans(fansAmount, isSpecial ? "special_kill" : "kill");
        }
    }

    private void CheckAchievements(int oldFans)
    {
        if (oldFans == 0 && currentFans >= 1)
        {
            OnAchievementUnlocked?.Invoke("veteran_fan");
        }
    }

    private void CheckStageProgress()
    {
        for (int i = currentStageIndex; i < fanStages.Length; i++)
        {
            if (!stageAchieved[i] && currentFans >= fanStages[i].fansRequired)
            {
                stageAchieved[i] = true;
                currentStageIndex = i;
                GrantStageRewards(fanStages[i]);
                OnFanStageReached?.Invoke(fanStages[i]);

                Debug.Log($"达到新粉丝阶段: {fanStages[i].stageName}");
            }
        }
    }

    private void GrantStageRewards(FanStage stage)
    {
        foreach (var reward in stage.rewards)
        {
            switch (reward.type)
            {
                case RewardType.Currency:
                    CurrencySys.Instance?.AddCurrency(reward.amount);
                    break;

                case RewardType.Exp:
                    ExpSys.Instance?.AddExp(reward.amount, "fan_stage");
                    break;

                case RewardType.Item:
                    InventorySys.Instance?.AddItem(reward.itemId, reward.amount);
                    break;

                case RewardType.UnlockContent:
                    UnlockGameContent(reward.contentId);
                    break;
            }
        }
    }

    private void UnlockGameContent(string contentId)
    {
        switch (contentId)
        {
            case "shop_access":
                GameProgressManager.Instance?.UnlockShop();
                break;

            case "mission_system":
                GameProgressManager.Instance?.UnlockMissionSystem();
                break;

            case "training_ground":
                GameProgressManager.Instance?.UnlockTrainingGround();
                break;

            case "hard_level_1":
            case "expert_levels":
                LevelManager.Instance?.UnlockLevel(contentId);
                break;
        }
    }

    public int CurrentFans => currentFans;
    public int TotalFansEarned => totalFansEarned;
    public FanStage CurrentStage => fanStages[currentStageIndex];
    public int GetCurrentStageIndex()
    {
        return currentStageIndex;
    }

    public void ResetFans()
    {
        currentFans = 0;
        totalFansEarned = 0;
        currentStageIndex = 0;
        stageAchieved = new bool[fanStages.Length];
        OnFansChanged?.Invoke(currentFans);
    }
}