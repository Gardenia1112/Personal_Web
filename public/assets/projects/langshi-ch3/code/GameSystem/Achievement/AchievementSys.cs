using System;
using System.Collections.Generic;
using UnityEngine;

public class AchievementSys : MonoBehaviour
{
    public static AchievementSys Instance;

    [System.Serializable]
    public class Achievement
    {
        public string achievementId;
        public string achievementName;
        public string description;
        public bool isUnlocked;
        public DateTime unlockTime;
        public AchievementType type;
        public int progressTarget;
        public int currentProgress;
    }

    [Header("成就列表")]
    public List<Achievement> achievements = new List<Achievement>();

    public event Action<Achievement> OnAchievementUnlocked;

    public enum AchievementType
    {
        Fans,           // 粉丝相关
        Combat,         // 战斗相关
        Progression,    // 进度相关
        Collection,     // 收集相关
        Special         // 特殊成就
    }

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeAchievements();
            LoadAchievementData();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeAchievements()
    {
        achievements = new List<Achievement>
        {
            // 粉丝相关成就
            new Achievement {
                achievementId = "veteran_fan",
                achievementName = "元老级粉丝！",
                description = "拥有第一波粉丝",
                type = AchievementType.Fans,
                progressTarget = 1
            },
            new Achievement {
                achievementId = "rising_star",
                achievementName = "新星崛起",
                description = "粉丝数达到50个",
                type = AchievementType.Fans,
                progressTarget = 50
            },
            
            // 战斗相关成就
            new Achievement {
                achievementId = "first_kill",
                achievementName = "主播出道了",
                description = "击败第一个敌人",
                type = AchievementType.Combat,
                progressTarget = 1
            },
            new Achievement {
                achievementId = "zombie_slayer",
                achievementName = "僵尸杀手",
                description = "击败100个敌人",
                type = AchievementType.Combat,
                progressTarget = 100
            },
            
            // 进度相关成就
            new Achievement {
                achievementId = "tutorial_complete",
                achievementName = "开播即毕业",
                description = "完成新手教程",
                type = AchievementType.Progression,
                progressTarget = 1
            },
            new Achievement {
                achievementId = "level_10",
                achievementName = "萌新UP前来报到",
                description = "达到10级",
                type = AchievementType.Progression,
                progressTarget = 10
            }
        };
    }
    public void UnlockAchievement(string achievementId)
    {
        var achievement = achievements.Find(a => a.achievementId == achievementId);
        if (achievement != null && !achievement.isUnlocked)
        {
            achievement.isUnlocked = true;
            achievement.unlockTime = DateTime.Now;
            OnAchievementUnlocked?.Invoke(achievement);
            GameEvents.TriggerAchievementUnlocked(achievementId);
            SaveAchievementData();
        }
    }
    public void UpdateAchievementProgress(string achievementId, int progressAmount = 1)
    {
        var achievement = achievements.Find(a => a.achievementId == achievementId);
        if (achievement != null && !achievement.isUnlocked)
        {
            achievement.currentProgress += progressAmount;

            if (achievement.currentProgress >= achievement.progressTarget)
            {
                UnlockAchievement(achievementId);
            }
            SaveAchievementData();
        }
    }
    public bool IsAchievementUnlocked(string achievementId)
    {
        var achievement = achievements.Find(a => a.achievementId == achievementId);
        return achievement?.isUnlocked ?? false;
    }
    public float GetAchievementProgress(string achievementId)
    {
        var achievement = achievements.Find(a => a.achievementId == achievementId);
        if (achievement != null)
        {
            return (float)achievement.currentProgress / achievement.progressTarget;
        }
        return 0f;
    }
    private void SaveAchievementData()
    {
        foreach (var achievement in achievements)
        {
            string key = $"Achievement_{achievement.achievementId}";
            PlayerPrefs.SetInt($"{key}_Unlocked", achievement.isUnlocked ? 1 : 0);
            PlayerPrefs.SetInt($"{key}_Progress", achievement.currentProgress);

            if (achievement.isUnlocked)
            {
                PlayerPrefs.SetString($"{key}_UnlockTime", achievement.unlockTime.ToString());
            }
        }
        PlayerPrefs.Save();
    }
    private void LoadAchievementData()
    {
        foreach (var achievement in achievements)
        {
            string key = $"Achievement_{achievement.achievementId}";
            achievement.isUnlocked = PlayerPrefs.GetInt($"{key}_Unlocked", 0) == 1;
            achievement.currentProgress = PlayerPrefs.GetInt($"{key}_Progress", 0);

            string unlockTimeStr = PlayerPrefs.GetString($"{key}_UnlockTime", "");
            if (!string.IsNullOrEmpty(unlockTimeStr))
            {
                DateTime.TryParse(unlockTimeStr, out achievement.unlockTime);
            }
        }
    }

    public void ResetAllAchievements()
    {
        foreach (var achievement in achievements)
        {
            achievement.isUnlocked = false;
            achievement.currentProgress = 0;
        }

        foreach (var achievement in achievements)
        {
            string key = $"Achievement_{achievement.achievementId}";
            PlayerPrefs.DeleteKey($"{key}_Unlocked");
            PlayerPrefs.DeleteKey($"{key}_Progress");
            PlayerPrefs.DeleteKey($"{key}_UnlockTime");
        }
        PlayerPrefs.Save();
    }
    public int GetUnlockedAchievementCount()
    {
        int count = 0;
        foreach (var achievement in achievements)
        {
            if (achievement.isUnlocked) count++;
        }
        return count;
    }

    public int GetTotalAchievementCount()
    {
        return achievements.Count;
    }
}
