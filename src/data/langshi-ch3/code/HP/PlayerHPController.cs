using System;
using System.Collections;
using System.ComponentModel;
using UnityEngine;
using UnityEngine.TextCore.Text;

public class PlayerHPController : MonoBehaviour
{
    public static PlayerHPController Instance;

    public float maxHP;
    public float currentHP;
    public float healCooldown = 10f;
    private float lastHealTime = -10f;

    public bool IsDead { get; private set; }
    public System.Action OnPlayerDied;

    public Renderer playerRenderer;
    public float hurtFlashTime = 0.2f;
    private Coroutine hurtFlashCoroutine;
    private Animator animator;
    private void Awake()
    {
        if (Instance == null)
            Instance = this;
        else
            Destroy(gameObject);

        animator = GetComponent<Animator>();
    }

    private void Start()
    {
        IsDead = false;

        if (playerRenderer == null)
        {
            playerRenderer = GetComponentInChildren<Renderer>();
        }

    }

    private void Update()
    {
        HandleHealInput();
    }

    //局外升级HP上限（永久）
    public void IncreaseMaxHPPre(float increaseAmount)
    {
        currentHP = StatisticsManager.Instance.CurrentHealth + increaseAmount;
        maxHP = StatisticsManager.Instance.MaxHealthPre + increaseAmount;

        GameEvents.TriggerPlayerMaxHealthPreChanged(maxHP);
        GameEvents.TriggerPlayerCurrentHealthChanged(currentHP);
    }

    //局内升级HP上限（单局）
    public void IncreaseMaxHPTem(float increaseAmount)
    {
        currentHP = StatisticsManager.Instance.CurrentHealth + increaseAmount;
        maxHP = StatisticsManager.Instance.MaxHealthTem + increaseAmount;

        GameEvents.TriggerPlayerCurrentHealthChanged(currentHP);
        GameEvents.TriggerPlayerMaxHealthTemChanged(maxHP);
    }

    //扣血
    public void TakeDamage(int damage)
    {
        
        if (IsDead) return;
        currentHP = StatisticsManager.Instance.CurrentHealth;
        maxHP = StatisticsManager.Instance.MaxHealth;
        currentHP = Mathf.Clamp(currentHP - damage, 0, maxHP);
        GameEvents.TriggerPlayerCurrentHealthChanged(currentHP);
        if (hurtFlashCoroutine != null)
            StopCoroutine(hurtFlashCoroutine);
        if (currentHP <= 0)
            HandlePlayerDeath();
    }

    private void HandleHealInput()
    {
        if (Input.GetKeyDown(KeyCode.Q) && CanHeal())
        {
            Heal(1);
            lastHealTime = Time.time;
        }
    }

    //回血
    public void Heal(int amount = 1)
    {
        currentHP = StatisticsManager.Instance.CurrentHealth;
        maxHP = StatisticsManager.Instance.MaxHealth;
        currentHP = Mathf.Clamp(currentHP + amount, 0, maxHP);
        GameEvents.TriggerPlayerCurrentHealthChanged(currentHP);
    }

    private bool CanHeal()
    {
        float timeSinceHeal = Time.time - lastHealTime;
        bool isCooldownOver = timeSinceHeal >= healCooldown;
        bool isNotFullHP = currentHP < maxHP;

        return isCooldownOver && isNotFullHP;
    }

    public void HandlePlayerDeath()
    {
        Debug.Log("玩家死亡");
        if (IsDead) return;
        IsDead = true;
        OnPlayerDied?.Invoke();
        animator.SetTrigger("Death");
        animator.Update(0);
        Character character = GetComponent<Character>();
        if (character != null)
        {
            character.Die();
        }
        else
        {
            Debug.LogWarning("PlayerHPController: 找不到组件");
        }
        // 这里可以添加游戏结束逻辑
        // 比如：重新开始场景、显示游戏结束画面等
    }
}