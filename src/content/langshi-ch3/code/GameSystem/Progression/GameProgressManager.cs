using System;
using System.Collections.Generic;
using UnityEngine;

public class GameProgressManager : MonoBehaviour
{
    public static GameProgressManager Instance;

    public bool tutorialCompleted = false;
    public bool shopUnlocked = false;
    public bool missionSystemUnlocked = false;
    public bool trainingGroundUnlocked = false;

    public event Action<string> OnSystemUnlocked;
    public event Action<Enemy, bool> OnEnemyKilledEvent;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeGameProgress();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeGameProgress()
    {
        tutorialCompleted = false;
        shopUnlocked = false;
        missionSystemUnlocked = false;
        trainingGroundUnlocked = false;
    }

    public void ProcessEnemyKill(Enemy enemy, bool isCombo, bool isSpecial)
    {
        if (enemy == null) return;

        HandleEnemyKillRewards(enemy, isSpecial);

        OnEnemyKilledEvent?.Invoke(enemy, isSpecial);
    }

    private void HandleEnemyKillRewards(Enemy enemy, bool isSpecial)
    {
        ExpSys.Instance?.AddExpFromKill(isSpecial);

        FansSys.Instance?.TryAddFansFromKill(isSpecial);

        //if (enemy.FlowReward > 0)
        //{
        //    FlowSys.Instance?.AddFlow(enemy.FlowReward, "enemy_kill");
        //}

        if (enemy.scoreValue > 0)
        {
            CurrencySys.Instance?.AddCurrency(enemy.scoreValue, "enemy_kill");
        }
    }

    public void CompleteTutorial()
    {
        tutorialCompleted = true;
        ExpSys.Instance?.CompleteTutorial();
        UnlockSystemFeature("main_menu");
        UnlockSystemFeature("basic_movement");
    }

    public void UnlockSystemFeature(string featureId)
    {
        switch (featureId)
        {
            case "shop_access":
                shopUnlocked = true;
                OnSystemUnlocked?.Invoke("商店功能已解锁");
                GameEvents.TriggerSystemUnlocked(featureId);
                break;

            case "mission_system":
                missionSystemUnlocked = true;
                OnSystemUnlocked?.Invoke("任务系统已解锁");
                GameEvents.TriggerSystemUnlocked(featureId);
                break;

            case "training_ground":
                trainingGroundUnlocked = true;
                OnSystemUnlocked?.Invoke("训练场已解锁");
                GameEvents.TriggerSystemUnlocked(featureId);
                break;

            case "main_menu":
                OnSystemUnlocked?.Invoke("主菜单已解锁");
                GameEvents.TriggerSystemUnlocked(featureId);
                break;

            case "basic_movement":
                OnSystemUnlocked?.Invoke("基础移动功能已解锁");
                GameEvents.TriggerSystemUnlocked(featureId);
                break;
        }
    }

    public void UnlockShop()
    {
        UnlockSystemFeature("shop_access");
    }

    public void UnlockMissionSystem()
    {
        UnlockSystemFeature("mission_system");
    }

    public void UnlockTrainingGround()
    {
        UnlockSystemFeature("training_ground");
    }

    public bool IsFeatureUnlocked(string featureId)
    {
        switch (featureId)
        {
            case "shop_access": return shopUnlocked;
            case "mission_system": return missionSystemUnlocked;
            case "training_ground": return trainingGroundUnlocked;
            default: return false;
        }
    }

    public string GetProgressStatus()
    {
        return $"教程完成: {tutorialCompleted}, 商店解锁: {shopUnlocked}, 任务系统: {missionSystemUnlocked}, 训练场: {trainingGroundUnlocked}";
    }

    public void ResetProgress()
    {
        tutorialCompleted = false;
        shopUnlocked = false;
        missionSystemUnlocked = false;
        trainingGroundUnlocked = false;
    }
}