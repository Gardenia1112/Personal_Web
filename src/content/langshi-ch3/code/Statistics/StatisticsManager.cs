using System;
using UnityEngine;
using System.Collections.Generic;

// 命名提醒:"session"开头代表单局变量

#region 数据类
[System.Serializable]

public class TemporaryData
{
    public float currentHealth;          // 当前生命值   
    public float maxHealth_tem;              // 生命值上限[暂时]
    public float defense_tem;                // 防御值[暂时]
    public float moveSpeed_tem;              // 移动速度[暂时]
    public float attackSpeed_tem;            // 攻击速度[暂时]
    public float attackDamage_tem;           // 攻击力[暂时]

    public float maxHealth;              // 生命值上限[总计]
    public float defense;                // 防御值[总计]
    public float moveSpeed;              // 移动速度[总计]
    public float attackSpeed;            // 攻击速度[总计]
    public float attackDamage;           // 攻击力[总计]

    [Header("单局统计")]
    public float sessionTrafficEarned;      // 本局流量增加
    public int sessionFansGained;         // 本局粉丝增加
    public int sessionKillCount;          // 本局击杀数
    public List<string> sessionAchievements = new List<string>(); // 本局完成的成就名称列表

    public int sessionTrafficTime;             // 本局（用流量的）升级次数

}


public class StatisticsData
{
    [Header("战斗属性")]
    public float maxHealth_pre;              // 生命值上限[永久]
    public float defense_pre;                // 防御值[永久]
    public float moveSpeed_pre;              // 移动速度[永久]
    public float attackSpeed_pre;            // 攻击速度[永久]
    public float attackDamage_pre;           // 攻击力[永久]

    [Header("直播相关")]
    public int liveViewerCount;           // 直播间观众数（类似于幸运）
    public float traffic;                   // 流量（局内升级货币）
    public int gold;                      // 金币（局外升级货币）
    public int totalFans;                 // 粉丝总数

    [Header("永久化数据")]
    public int totalKills;                // 历史总击杀
    public int totalSessionsPlayed;       // 总游戏局数
    public int highestViewerCount;        // 历史最高观众数
    public List<string> unlockedAchievements = new List<string>();  // 已解锁的成就名称列表

}

#endregion 

public class StatisticsManager : MonoBehaviour
{
    public static StatisticsManager Instance { get; private set; }

    // 当前统计数据
    private StatisticsData _currentStats;
    private TemporaryData _temporaryStats;

    // 事件定义（用于实时通知其他系统）
    public event Action OnStatisticsUpdated;
    public event Action<float> OnTrafficChanged;
    public event Action<int> OnGoldChanged;
    public event Action<int> OnKillCountChanged;
    public event Action<int> OnViewerCountChanged;

    // 保存的键名
    private const string STATS_SAVE_KEY = "GameStatistics_V1";

    void Awake()
    {
        _temporaryStats = new TemporaryData();

        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);
        LoadStatistics();
    }

    #region 初始值
    // 即“新建统计存档”，有两种自动调用情况：
    // 1 游戏启动时，若没有存档会被自动调用
    // 2 运行“重置”后会被自动调用
    private void InitializeStats()
    {
        // 战斗属性
        _temporaryStats.currentHealth = 500f; //当前生命值

        _currentStats.maxHealth_pre = 500f;     //生命值上限
        _currentStats.defense_pre = 0f;         //防御值
        _currentStats.moveSpeed_pre = 5f;       //移动速度
        _currentStats.attackSpeed_pre = 1f;     //攻击速度
        _currentStats.attackDamage_pre = 10f;   //攻击力

        _temporaryStats.maxHealth_tem = 0f;     //生命值上限
        _temporaryStats.defense_tem = 0f;         //防御值
        _temporaryStats.moveSpeed_tem = 0f;       //移动速度
        _temporaryStats.attackSpeed_tem = 0f;     //攻击速度
        _temporaryStats.attackDamage_tem = 0f;   //攻击力

        // 单局统计
        _currentStats.traffic = 0;          //流量（局内升级货币）
        _temporaryStats.sessionTrafficEarned = 0;       //本局流量增加
        _temporaryStats.sessionFansGained = 0;          //本局粉丝增加
        _temporaryStats.sessionKillCount = 0;           //本局击杀数
        if (_temporaryStats.sessionAchievements != null)//本局解锁成就
            _temporaryStats.sessionAchievements.Clear();
        if (_currentStats.unlockedAchievements != null)//全部解锁成就
            _currentStats.unlockedAchievements.Clear();

        //更新总和的值
        _temporaryStats.maxHealth = _currentStats.maxHealth_pre + _temporaryStats.maxHealth_tem;
        _temporaryStats.defense = _currentStats.defense_pre + _temporaryStats.defense_tem;
        _temporaryStats.moveSpeed = _temporaryStats.moveSpeed_tem + _currentStats.moveSpeed_pre;
        _temporaryStats.attackSpeed = _currentStats.attackSpeed_pre + _temporaryStats.attackSpeed_tem;
        _temporaryStats.attackDamage = _currentStats.attackDamage_pre + _temporaryStats.attackDamage_tem;

        SaveStatistics();
    }
    #endregion

    #region 新局值
    // 游戏内新一局开始时，请*手动*调用它
    public void StartNewSession()
    {
        //总局数统计加1
        _currentStats.totalSessionsPlayed++;

        // 清零单局统计（观众数，流量上涨，粉丝获取，击杀数，成就解锁，升级次数）
        _temporaryStats.sessionTrafficTime = 0;
        _temporaryStats.sessionTrafficEarned = 0;
        _temporaryStats.sessionFansGained = 0;
       _temporaryStats.sessionKillCount = 0;
        if (_temporaryStats.sessionAchievements != null)
            _temporaryStats.sessionAchievements.Clear();

        // 重置局内属性为默认值（生命回满，流量清零）
        _temporaryStats.currentHealth = _currentStats.maxHealth_pre;
        _currentStats.traffic = 0;

        // 暂时类战斗属性重置
        _temporaryStats.maxHealth_tem = 0f;     //生命值上限
        _temporaryStats.defense_tem = 0f;         //防御值
        _temporaryStats.moveSpeed_tem = 0f;       //移动速度
        _temporaryStats.attackSpeed_tem = 0f;     //攻击速度
        _temporaryStats.attackDamage_tem = 0f;   //攻击力

        //更新总和的值
        _temporaryStats.maxHealth = _currentStats.maxHealth_pre + _temporaryStats.maxHealth_tem;
        _temporaryStats.defense = _currentStats.defense_pre +_temporaryStats.defense_tem;
        _temporaryStats.moveSpeed = _temporaryStats.moveSpeed_tem + _currentStats.moveSpeed_pre;
        _temporaryStats.attackSpeed = _currentStats.attackSpeed_pre + _temporaryStats.attackSpeed_tem;
        _temporaryStats.attackDamage = _currentStats.attackDamage_pre + _temporaryStats.attackDamage_tem;
        SaveStatistics();
        OnStatisticsUpdated?.Invoke();
        Debug.Log("*新一局开始");
    }

    #endregion

    #region 战斗相关
    // 战斗属性

    //当前生命值（不用分回血是单局还算永远，因为每局开局都是满血）
    public float CurrentHealth
    {
        get => _temporaryStats.currentHealth;
        set
        {
            _temporaryStats.currentHealth = value;
        }
    }

    #region 永久

    public float MaxHealthPre
    {
        get => _currentStats.maxHealth_pre;
        set
        {
            _currentStats.maxHealth_pre = value;
           _temporaryStats.maxHealth = _currentStats.maxHealth_pre + _temporaryStats.maxHealth_tem;
            SaveStatistics();
        }
    }

    public float DefensePre
    {
        get => _currentStats.defense_pre;
        set
        {
            _currentStats.defense_pre = value;
            _temporaryStats.defense = _currentStats.defense_pre + _temporaryStats.defense_tem;
            SaveStatistics();
        }
    }

    public float MoveSpeedPre
    {
        get => _currentStats.moveSpeed_pre;
        set { _currentStats.moveSpeed_pre = value; _temporaryStats.moveSpeed = _currentStats.moveSpeed_pre + _temporaryStats.moveSpeed_tem; SaveStatistics(); }
    }

    public float AttackSpeedPre
    {
        get => _currentStats.attackSpeed_pre;
        set { _currentStats.attackSpeed_pre = value; _temporaryStats.attackSpeed = _currentStats.attackSpeed_pre + _temporaryStats.attackSpeed_tem; SaveStatistics(); }
    }

    public float AttackDamagePre
    {
        get => _currentStats.attackDamage_pre;
        set { _currentStats.attackDamage_pre = value; _temporaryStats.attackDamage = _currentStats.attackDamage_pre + _temporaryStats.attackDamage_tem; SaveStatistics(); }
    }
    #endregion
    #region 暂时

    public int SessionTrafficTime
    {
        get => _temporaryStats.sessionTrafficTime;
        set { _temporaryStats.sessionTrafficTime = value; }
    }

    public float MaxHealthTem
    {
        get => _temporaryStats.maxHealth_tem;
        set
        {
            _temporaryStats.maxHealth_tem = value;
            _temporaryStats.maxHealth = _currentStats.maxHealth_pre + _temporaryStats.maxHealth_tem;
        }
    }

    public float DefenseTem
    {
        get => _temporaryStats.defense_tem;
        set { _temporaryStats.defense_tem = value; _temporaryStats.defense = _currentStats.defense_pre + _temporaryStats.defense_tem; }

    }

    public float MoveSpeedTem
    {
        get => _temporaryStats.moveSpeed_tem;
        set { _temporaryStats.moveSpeed_tem = value; _temporaryStats.moveSpeed = _currentStats.moveSpeed_pre + _temporaryStats.moveSpeed_tem; }
    }

    public float AttackSpeedTem
    {
        get => _temporaryStats.attackSpeed_tem;
        set { _temporaryStats.attackSpeed_tem = value;_temporaryStats.attackSpeed = _currentStats.attackSpeed_pre + _temporaryStats.attackSpeed_tem; }
    }

    public float AttackDamageTem
    {
        get => _temporaryStats.attackDamage_tem;
        set { _temporaryStats.attackDamage_tem = value; _temporaryStats.attackDamage = _currentStats.attackDamage_pre + _temporaryStats.attackDamage_tem; }
    }
    #endregion
    #region 总和

    public float MaxHealth
    {
        get => _temporaryStats.maxHealth;
    }

    public float Defense
    {
        get => _temporaryStats.defense;
    }

    public float MoveSpeed
    {
        get => _temporaryStats.moveSpeed;
    }

    public float AttackSpeed
    {
        get => _temporaryStats.attackSpeed;
    }

    public float AttackDamage
    {
        get => _temporaryStats.attackDamage;
    }
    #endregion

    #region 更新记录

    // 更新历史观众最高记录
    public int LiveViewerCount
    {
        get => _currentStats.liveViewerCount;
        set
        {
            _currentStats.liveViewerCount = Mathf.Max(0, value);
            if (_currentStats.liveViewerCount > _currentStats.highestViewerCount)
            {
                _currentStats.highestViewerCount = _currentStats.liveViewerCount;
            }

            SaveStatistics();
            OnViewerCountChanged?.Invoke(_currentStats.liveViewerCount);
            OnStatisticsUpdated?.Invoke();
        }
    }
    //查询历史最高观众数
    public int HighestViewerCount
    {
        get => _currentStats.highestViewerCount;
    }
    #endregion

    #region 货币相关
    // 查询流量（局内货币）
    public float Traffic
    {
        get => _currentStats.traffic;
    }
    /// 增加流量
    public void ChangTraffic(float amount)
    {
        if (amount < 0) return;

        _currentStats.traffic += amount;
        _temporaryStats.sessionTrafficEarned += amount;

        SaveStatistics();
        OnTrafficChanged?.Invoke(_currentStats.traffic);
        OnStatisticsUpdated?.Invoke();
    }

    // 消耗流量（局内升级），返回是否成功
    public bool SpendTraffic(float amount)
    {
        if (_currentStats.traffic < amount) return false;

        _currentStats.traffic -= amount;
        SaveStatistics();
        OnTrafficChanged?.Invoke(_currentStats.traffic);
        OnStatisticsUpdated?.Invoke();
        return true;
    }

    // 查询金币（局外货币）
    public int Gold
    {
        get => _currentStats.gold;
    }

    // 增加金币
    public void ChangGold(int amount)
    {
        if (amount < 0) return;

        _currentStats.gold += amount;
        SaveStatistics();
        OnGoldChanged?.Invoke(_currentStats.gold);
        OnStatisticsUpdated?.Invoke();
    }

    // 消耗金币（局外升级），返回是否成功
    public bool SpendGold(int amount)
    {
        if (_currentStats.gold < amount) return false;

        _currentStats.gold -= amount;
        SaveStatistics();
        OnGoldChanged?.Invoke(_currentStats.gold);
        OnStatisticsUpdated?.Invoke();
        return true;
    }

    // 查询总粉丝
    public int TotalFans
    {
        get => _currentStats.totalFans;
    }
    //查询本局增加粉丝
    public int SessionFansGained
    {
        get => _temporaryStats.sessionFansGained;
    }
    // 增加粉丝
    public void ChangFans(int amount)
    {
        if (amount < 0) return;

        _currentStats.totalFans += amount;
        _temporaryStats.sessionFansGained += amount;
        SaveStatistics();
        OnStatisticsUpdated?.Invoke();
    }
    #endregion
    #region 成就统计
    //查询总击杀
    public int TotalKills
    {
        get => _currentStats.totalKills;
    }
    // 查询本局击杀
    public int SessionKillCount
    {
        get => _temporaryStats.sessionKillCount;
    }
    // 增加击杀（加1）
    public void KillPlus()
    {
        _temporaryStats.sessionKillCount++;
        _currentStats.totalKills++;

        SaveStatistics();
        OnKillCountChanged?.Invoke(_currentStats.totalKills);
        OnStatisticsUpdated?.Invoke();
    }

    // 查询总成就（一个字符串列表）
    public List<string> GetUnlockedAchievements()
    {
        return new List<string>(_currentStats.unlockedAchievements);
    }
    // 查询本局成就（一个字符串列表）
    public List<string> GetSessionAchievements()
    {
        return new List<string>(_temporaryStats.sessionAchievements);
    }
    //增加新完成的成就（输入字符串）
    public void UnlockAchievement(string achievementName)
    {
        if (_currentStats.unlockedAchievements.Contains(achievementName))
            return;

        _currentStats.unlockedAchievements.Add(achievementName);
        _temporaryStats.sessionAchievements.Add(achievementName);

        SaveStatistics();
        OnStatisticsUpdated?.Invoke();
        Debug.Log("*解锁成就：" + achievementName);
    }

    // 查询游戏总局数
    public int TotalSessionsPlayed
    {
        get => _currentStats.totalSessionsPlayed;
    }
    #endregion
    #endregion

    #region 持久化

    private void SaveStatistics()
    {
        try
        {
            string jsonData = JsonUtility.ToJson(_currentStats);
            PlayerPrefs.SetString(STATS_SAVE_KEY, jsonData);
            PlayerPrefs.Save();
            Debug.Log("*统计数据已保存");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"*保存统计失败: {e.Message}");
        }
    }

    private void LoadStatistics()
    {
        //PlayerPrefs.DeleteKey(STATS_SAVE_KEY);
        //可以用这句测试删除存档的情况
        try
        {
            if (PlayerPrefs.HasKey(STATS_SAVE_KEY))
            {
                string jsonData = PlayerPrefs.GetString(STATS_SAVE_KEY);
                _currentStats = JsonUtility.FromJson<StatisticsData>(jsonData);

                // 确保 List 不为 null
                if (_temporaryStats.sessionAchievements == null)
                    _temporaryStats.sessionAchievements = new List<string>();
                if (_currentStats.unlockedAchievements == null)
                    _currentStats.unlockedAchievements = new List<string>();

                Debug.Log("*统计数据加载成功");
            }
            else
            {
                //初始化新统计数据
                Debug.Log("*创建默认统计数据");
                _currentStats = new StatisticsData();
                InitializeStats();

            }
        }
        catch (System.Exception e)
        {
            Debug.LogError($"*加载统计失败：{e.Message}");
            _currentStats = new StatisticsData();
        }
    }

    #endregion

    #region 公共方法

    // 重置为默认数据（谨慎使用！）
    public void ResetToDefault()
    {
        _currentStats = new StatisticsData();
        Debug.Log("*统计数据已重置为默认");
        InitializeStats();
        OnStatisticsUpdated?.Invoke();
    }

    // 获取完整统计数据（供其他系统使用）
    public StatisticsData GetCurrentStatistics()
    {
        return _currentStats;
    }

    // 强制保存（比如游戏退出前）
    public void ForceSave()
    {
        SaveStatistics();
    }

    #endregion

    #region 生命周期

    void OnApplicationQuit()
    {
        SaveStatistics();
    }

    void OnDisable()
    {
        SaveStatistics();
    }

    #endregion

    #region 事件监听
    void Start()
    {
        GameEvents.OnPlayerCurrentHealthChanged += health => CurrentHealth = Mathf.Min(health, MaxHealth);
        GameEvents.OnPlayerMaxHealthPreChanged += health => MaxHealthPre = health;
        GameEvents.OnPlayerMaxHealthTemChanged += health => MaxHealthTem = health;
        GameEvents.OnPlayerAttackDamagePreChanged += damage => AttackDamagePre = damage;
        GameEvents.OnPlayerAttackDamageTemChanged += damage => AttackDamageTem = damage;
        GameEvents.OnPlayerAttackSpeedPreChanged += speed => AttackSpeedPre = speed;
        GameEvents.OnPlayerAttackSpeedTemChanged += speed => AttackSpeedTem = speed;
        GameEvents.OnPlayerMoveSpeedPreChanged += speed => MoveSpeedPre = speed;
        GameEvents.OnPlayerMoveSpeedTemChanged += speed => MoveSpeedTem = speed;

        GameEvents.OnFansChanged += count => ChangFans(count);
        GameEvents.OnGoldChanged += amount => ChangGold(amount);
        GameEvents.OnTrafficChanged += amount => ChangTraffic(amount);
        GameEvents.OnViewerCountChanged += amount => LiveViewerCount = amount;

        GameEvents.OnAchievementUnlocked += achievementId => UnlockAchievement(achievementId);

    }
    #endregion
}