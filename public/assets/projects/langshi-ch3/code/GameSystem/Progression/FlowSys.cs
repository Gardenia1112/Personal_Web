using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FlowSys : MonoBehaviour
{
    public static FlowSys Instance;

    [Header("流量系统配置")]
    [SerializeField] private float currentFlow = 0f;
    [SerializeField] private float maxFlow = 100f;
    [SerializeField] public bool isInFlowWave = false;

    [Header("流量热潮配置")]
    public float flowWaveThreshold = 80f;
    public float flowDrainRate = 10f;
    public float flowWaveDuration = 10f;
    public float baseFanMultiplier = 1.5f;
    public float baseFlowMultiplier = 2f;
    public float moveSpeedBonus = 1.2f;
    public float jumpHeightBonus = 1.3f;

    [Header("升级选项配置")]
    public UpgradeOption[] upgradeOptions = {
        new UpgradeOption {
            type = UpgradeType.MoveSpeed,
            value = 0.2f,
            name = "极速移动",
            description = "移动速度增加20%",
            icon = null
        },
        new UpgradeOption {
            type = UpgradeType.JumpHeight,
            value = 0.25f,
            name = "超级跳跃",
            description = "跳跃高度增加25%",
            icon = null
        },
        new UpgradeOption {
            type = UpgradeType.FanGain,
            value = 0.3f,
            name = "粉丝狂热",
            description = "粉丝获取增加30%",
            icon = null
        },
        new UpgradeOption {
            type = UpgradeType.FlowGain,
            value = 0.4f,
            name = "流量爆发",
            description = "流量获取增加40%",
            icon = null
        }
    };

    public event Action<float> OnFlowChanged;
    public event Action OnFlowWaveStarted;
    public event Action OnFlowWaveEnded;
    public event Action<UpgradeOption[]> OnUpgradeSelection;

    private Dictionary<UpgradeType, float> activeUpgrades = new Dictionary<UpgradeType, float>();
    private float flowWaveTimer = 0f;
    private Coroutine flowWaveCoroutine;

    // 添加这两个公共属性
    public float fansMultiplierInWave => GetFanMultiplier();
    public float flowMultiplierInWave => GetFlowMultiplier();

    [System.Serializable]
    public class UpgradeOption
    {
        public UpgradeType type;
        public float value;
        public string name;
        public string description;
        public Sprite icon;
    }

    public enum UpgradeType
    {
        MoveSpeed,
        JumpHeight,
        FanGain,
        FlowGain
    }

    void Awake()
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
        if (isInFlowWave)
        {
            UpdateFlowWave();
        }
    }

    public void AddFlow(float amount, string source = "default")
    {
        if (isInFlowWave) return;

        float oldFlow = currentFlow;
        currentFlow = Mathf.Min(currentFlow + amount, maxFlow);

        OnFlowChanged?.Invoke(currentFlow);
        GameEvents.TriggerFlowChanged(currentFlow);
        if (!isInFlowWave && currentFlow >= flowWaveThreshold)
        {
            StartFlowWave();
        }
    }

    public void StartFlowWave()
    {
        if (isInFlowWave) return;

        isInFlowWave = true;
        flowWaveTimer = flowWaveDuration;

        ShowUpgradeSelection();
        OnFlowWaveStarted?.Invoke();
        GameEvents.TriggerFlowWaveStarted();
        ExpSys.Instance?.AddExpFromFlowWave();
    }

    private void ShowUpgradeSelection()
    {
        List<UpgradeOption> selectedUpgrades = new List<UpgradeOption>();
        List<UpgradeOption> availableOptions = new List<UpgradeOption>(upgradeOptions);

        for (int i = 0; i < 3 && availableOptions.Count > 0; i++)
        {
            int randomIndex = UnityEngine.Random.Range(0, availableOptions.Count);
            selectedUpgrades.Add(availableOptions[randomIndex]);
            availableOptions.RemoveAt(randomIndex);
        }

        OnUpgradeSelection?.Invoke(selectedUpgrades.ToArray());
    }

    public void ApplyUpgrade(UpgradeOption selectedUpgrade)
    {
        activeUpgrades[selectedUpgrade.type] = selectedUpgrade.value;
        if (flowWaveCoroutine != null) StopCoroutine(flowWaveCoroutine);
        flowWaveCoroutine = StartCoroutine(FlowWaveCountdown());
    }

    private IEnumerator FlowWaveCountdown()
    {
        while (flowWaveTimer > 0 && currentFlow > 0)
        {
            currentFlow -= flowDrainRate * Time.deltaTime;
            currentFlow = Mathf.Max(0, currentFlow);

            OnFlowChanged?.Invoke(currentFlow);
            flowWaveTimer -= Time.deltaTime;

            yield return null;
        }

        EndFlowWave();
    }

    private void UpdateFlowWave()
    {
        if (flowWaveTimer <= 0 || currentFlow <= 0)
        {
            EndFlowWave();
        }
    }

    public void EndFlowWave()
    {
        if (!isInFlowWave) return;

        isInFlowWave = false;
        activeUpgrades.Clear();

        OnFlowWaveEnded?.Invoke();
        GameEvents.TriggerFlowWaveEnded();
        if (flowWaveCoroutine != null)
        {
            StopCoroutine(flowWaveCoroutine);
            flowWaveCoroutine = null;
        }
    }
    public float GetFanMultiplier()
    {
        float multiplier = baseFanMultiplier;
        if (activeUpgrades.ContainsKey(UpgradeType.FanGain))
        {
            multiplier *= (1 + activeUpgrades[UpgradeType.FanGain]);
        }
        return multiplier;
    }

    public float GetFlowMultiplier()
    {
        float multiplier = baseFlowMultiplier;
        if (activeUpgrades.ContainsKey(UpgradeType.FlowGain))
        {
            multiplier *= (1 + activeUpgrades[UpgradeType.FlowGain]);
        }
        return multiplier;
    }

    public float GetMoveSpeedMultiplier()
    {
        float multiplier = moveSpeedBonus;
        if (activeUpgrades.ContainsKey(UpgradeType.MoveSpeed))
        {
            multiplier *= (1 + activeUpgrades[UpgradeType.MoveSpeed]);
        }
        return multiplier;
    }

    public float GetJumpHeightMultiplier()
    {
        float multiplier = jumpHeightBonus;
        if (activeUpgrades.ContainsKey(UpgradeType.JumpHeight))
        {
            multiplier *= (1 + activeUpgrades[UpgradeType.JumpHeight]);
        }
        return multiplier;
    }

    public float CurrentFlow => currentFlow;
    public float MaxFlow => maxFlow;
    public bool IsInFlowWave => isInFlowWave;
    public float FlowWaveProgress => isInFlowWave ? (flowWaveTimer / flowWaveDuration) : 0f;

    public void ResetFlow()
    {
        currentFlow = 0f;
        isInFlowWave = false;
        activeUpgrades.Clear();
        OnFlowChanged?.Invoke(currentFlow);

        if (flowWaveCoroutine != null)
        {
            StopCoroutine(flowWaveCoroutine);
            flowWaveCoroutine = null;
        }
    }
}