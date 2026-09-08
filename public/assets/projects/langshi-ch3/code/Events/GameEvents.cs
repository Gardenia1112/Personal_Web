using System;
using UnityEngine;

public static class GameEvents
{
    // 玩家事件
    public static event Action<Character> OnPlayerSpawn;
    public static event Action<Character> OnPlayerDeath;
    public static event Action<float> OnPlayerCurrentHealthChanged;
    //以下：区分永久/单局
    public static event Action<float> OnPlayerMaxHealthPreChanged;
    public static event Action<float> OnPlayerMaxHealthTemChanged;
    public static event Action<int> OnPlayerMoveSpeedPreChanged;
    public static event Action<int> OnPlayerMoveSpeedTemChanged;
    public static event Action<int> OnPlayerAttackSpeedPreChanged;
    public static event Action<int> OnPlayerAttackSpeedTemChanged;
    public static event Action<int> OnPlayerAttackDamagePreChanged;
    public static event Action<int> OnPlayerAttackDamageTemChanged;
    public static event Action<int, int> OnPlayerExpChanged;
    public static event Action<int> OnPlayerLevelUp;

    // 敌人事件
    public static event Action<Enemy> OnEnemySpawn;
    public static event Action<Enemy, bool> OnEnemyKilled; // bool isSpecial

    // 效益事件
    public static event Action<int> OnCurrencyChanged;
    public static event Action<int> OnFansChanged;
    public static event Action<int> OnBulletChanged;
    public static event Action<float> OnFlowChanged;
    public static event Action OnFlowWaveStarted;
    public static event Action OnFlowWaveEnded;
    public static event Action<int> OnGoldChanged;// 金币

    // 伤害事件
    public static event Action<float, GameObject> OnDamageDealt; // 造成伤害值，目标


    // 属性变化事件
    public static event Action<string, float, float> OnPlayerStatChanged; // 属性名，旧值，新值

    // 观众数事件
    public static event Action<int> OnViewerCountChanged;

    // 升级事件
    public static event Action<string> OnSystemUnlocked;
    public static event Action<string> OnContentUnlocked;
    public static event Action<string> OnAchievementUnlocked;
    public static event Action<float> OnTrafficChanged;// 流量  
    // 教程事件
    public static event Action<string> OnTutorialStepStarted;
    public static event Action<string> OnTutorialStepCompleted;
    public static event Action OnTutorialCompleted;

    // 输入事件
    public static event Action<string> OnPlayerAction; // "move", "jump", "attack", "dash"

    // 玩家事件触发
    public static void TriggerPlayerSpawn(Character player) => OnPlayerSpawn?.Invoke(player);
    public static void TriggerPlayerDeath(Character player) => OnPlayerDeath?.Invoke(player);
    //生命值（永久/单局），生命值上限（永久/单局）
    public static void TriggerPlayerCurrentHealthChanged(float health) => OnPlayerCurrentHealthChanged?.Invoke(health);
    public static void TriggerPlayerMaxHealthPreChanged(float health) => OnPlayerMaxHealthPreChanged?.Invoke(health);
    public static void TriggerPlayerMaxHealthTemChanged(float health) => OnPlayerMaxHealthTemChanged?.Invoke(health);
    //攻速（永久/单局），移速（永久/单局），攻击力（永久/单局）
    public static void TriggerMoveSpeedPreChanged(int speed) => OnPlayerMoveSpeedPreChanged?.Invoke(speed);
    public static void TriggerMoveSpeedTemChanged(int speed) => OnPlayerMoveSpeedTemChanged?.Invoke(speed);
    public static void TriggerAttackSpeedPreChanged(int speed) => OnPlayerAttackSpeedPreChanged?.Invoke(speed);
    public static void TriggerAttackSpeedTemChanged(int speed) => OnPlayerAttackSpeedTemChanged?.Invoke(speed);
    public static void TriggerAttackDamagePreChanged(int damage) => OnPlayerAttackDamagePreChanged?.Invoke(damage);
    public static void TriggerAttackDamageTemChanged(int damage) => OnPlayerAttackDamageTemChanged?.Invoke(damage);
    //（永久/本局）的区分结束
    public static void TriggerPlayerExpChanged(int currentExp, int nextLevelExp) => OnPlayerExpChanged?.Invoke(currentExp, nextLevelExp);
    public static void TriggerPlayerLevelUp(int level) => OnPlayerLevelUp?.Invoke(level);
    public static void TriggerDamageDealt(float damage, GameObject target) => OnDamageDealt?.Invoke(damage, target);
    public static void TriggerPlayerStatChanged(string statType, float oldValue, float newValue) => OnPlayerStatChanged?.Invoke(statType, oldValue, newValue);

    // 敌人事件触发
    public static void TriggerEnemySpawn(Enemy enemy) => OnEnemySpawn?.Invoke(enemy);
    public static void TriggerEnemyKilled(Enemy enemy, bool isSpecial = false) => OnEnemyKilled?.Invoke(enemy, isSpecial);

    // 效益事件触发
    public static void TriggerCurrencyChanged(int amount) => OnCurrencyChanged?.Invoke(amount);
    public static void TriggerFansChanged(int count) => OnFansChanged?.Invoke(count);
    public static void TriggerFlowChanged(float flow) => OnFlowChanged?.Invoke(flow);
    public static void TriggerFlowWaveStarted() => OnFlowWaveStarted?.Invoke();
    public static void TriggerFlowWaveEnded() => OnFlowWaveEnded?.Invoke();
    public static void TriggerGoldChanged(int amount) => OnGoldChanged?.Invoke(amount);
    public static void TriggerBulletChanged(int count) => OnBulletChanged?.Invoke(count);
    // 升级事件触发
    public static void TriggerSystemUnlocked(string systemId) => OnSystemUnlocked?.Invoke(systemId);
    public static void TriggerContentUnlocked(string contentId) => OnContentUnlocked?.Invoke(contentId);
    public static void TriggerAchievementUnlocked(string achievementId) => OnAchievementUnlocked?.Invoke(achievementId);
    public static void TriggerViewerCountChanged(int count) => OnViewerCountChanged?.Invoke(count);
    public static void TriggerTrafficChanged(float amount) => OnTrafficChanged?.Invoke(amount);

    // 教程事件触发
    public static void TriggerTutorialStepStarted(string stepName) => OnTutorialStepStarted?.Invoke(stepName);
    public static void TriggerTutorialStepCompleted(string stepName) => OnTutorialStepCompleted?.Invoke(stepName);
    public static void TriggerTutorialCompleted() => OnTutorialCompleted?.Invoke();

    // 输入事件触发
    public static void TriggerPlayerAction(string action) => OnPlayerAction?.Invoke(action);
}