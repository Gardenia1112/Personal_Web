using UnityEngine;

public class EnemyRewardSys : MonoBehaviour
{
    public static EnemyRewardSys Instance;

    [Header("µÐÈË½±ÀøÅäÖÃ")]
    public int baseExpReward = 10;
    public int baseCurrencyReward = 5;
    public int baseFlowReward = 15;

    [Header("ÌØÊâµÐÈË½±Àø±¶Êý")]
    public float specialEnemyMultiplier = 2.0f;
    public float bossEnemyMultiplier = 5.0f;

    [Header("Á¬É±½±Àø")]
    public float comboMultiplier = 1.0f;
    public float maxComboMultiplier = 3.0f;
    public float comboDecayTime = 3.0f;

    private int currentCombo = 0;
    private float lastKillTime = 0f;

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

    private void Update()
    {
        if (currentCombo > 0 && Time.time - lastKillTime > comboDecayTime)
        {
            currentCombo = 0;
            comboMultiplier = 1.0f;
        }
    }

    public void OnEnemyKilled(bool isSpecialEnemy = false, bool isStylishKill = false)
    {
        UpdateCombo();
        float multiplier = GetEnemyMultiplier(isSpecialEnemy) * comboMultiplier;
        if (isStylishKill) multiplier *= 1.5f;
        GrantRewards(multiplier, isSpecialEnemy, isStylishKill);
    }

    private void UpdateCombo()
    {
        currentCombo++;
        lastKillTime = Time.time;

        comboMultiplier = Mathf.Min(1.0f + (currentCombo / 5) * 0.5f, maxComboMultiplier);
    }

    private float GetEnemyMultiplier(bool isSpecialEnemy)
    {
        if (isSpecialEnemy) return specialEnemyMultiplier;
        return 1.0f;
    }

    private void GrantRewards(float multiplier, bool isSpecialEnemy, bool isStylishKill)
    {
        int expReward = Mathf.RoundToInt(baseExpReward * multiplier);
        ExpSys.Instance?.AddExpFromKill(isSpecialEnemy);

        int currencyReward = Mathf.RoundToInt(baseCurrencyReward * multiplier);
        CurrencySys.Instance?.AddCurrencyFromKill(isSpecialEnemy);

        int flowReward = Mathf.RoundToInt(baseFlowReward * multiplier);
        FlowSys.Instance?.AddFlow(flowReward, "enemy_kill");

        FansSys.Instance?.TryAddFansFromKill(isSpecialEnemy);

        if (isStylishKill)
        {
            StylishActionSys.Instance?.PerformStylishAction("stylish_kill");
        }
    }

    public int GetCurrentCombo()
    {
        return currentCombo;
    }

    public float GetCurrentComboMultiplier()
    {
        return comboMultiplier;
    }

    public void ResetCombo()
    {
        currentCombo = 0;
        comboMultiplier = 1.0f;
    }
}