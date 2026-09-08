using UnityEngine;
using System.Collections;

public class Enemy : MonoBehaviour
{
    [Header("基本设置")]
    public int scoreValue = 10;
    public float baseSpeed = 3f;
    public float attackDistance = 1f;
    public int damage = 100;
    // 改这里没有用，去unity检查器里改
    public Transform player;
    public GameObject deathEffect;
    public EnemyHealth enemyHealth;

    [Header("移动和物理设置")]
    public float gravity = -30f;
    public float groundCheckDistance = 0.1f;
    public LayerMask groundMask = 1;

    [Header("死亡设置")]
    public float deathDisappearDelay = 2f; 

    [Header("奖励")]
    public bool IsSpecialEnemy = false;
    public bool IsBossEnemy = false;

    private CharacterController characterController;
    private Vector3 spawnPosition;
    private bool isDead = false;
    private bool hasAttacked = false;
    private Vector3 moveDirection;
    private Vector3 velocity;
    private bool isGrounded;
    private Coroutine attackCoroutine;
    private Coroutine deathCoroutine;

    private Collider enemyCollider;
    private float currentSpeed;

    public bool IsDead => isDead;

    void Start()
    {
        InitializeEnemy();
    }

    private void InitializeEnemy()
    {
        spawnPosition = transform.position;
        currentSpeed = baseSpeed;

        FindPlayer();
        InitializeComponents();
        SetupHealthEvents();
    }


    private void FindPlayer()
    {
        if (player == null)
        {
            GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
            if (playerObj != null) player = playerObj.transform;
        }
    }

    private void InitializeComponents()
    {
        characterController = GetComponent<CharacterController>();
        enemyCollider = GetComponent<Collider>();

        if (characterController == null)
        {
            characterController = gameObject.AddComponent<CharacterController>();
            characterController.height = 2.0f;
            characterController.radius = 0.5f;
            characterController.center = new Vector3(0, 1f, 0);
        }

        if (enemyHealth == null)
            enemyHealth = GetComponent<EnemyHealth>();
    }

    private void SetupHealthEvents()
    {
        if (enemyHealth != null)
        {
            enemyHealth.OnDeath += OnHealthDeath;
        }
    }

    private void Update()
    {
        if (isDead || player == null) return;
        UpdateEnemyState();
    }

    private void UpdateEnemyState()
    {
        CheckGrounded();
        HandleEnemyAI();
        ApplyGravity();
    }

    private void CheckGrounded()
    {
        RaycastHit hit;
        isGrounded = Physics.Raycast(transform.position, Vector3.down, out hit, groundCheckDistance, groundMask);
    }

    private void HandleEnemyAI()
    {
        if (player == null) return;

        Vector3 toPlayer = (player.position - transform.position).normalized;
        toPlayer.y = 0;
        moveDirection = toPlayer;

        float distanceToPlayer = Vector3.Distance(transform.position, player.position);

        if (distanceToPlayer > attackDistance)
        {
            Vector3 movement = moveDirection * currentSpeed * Time.deltaTime;
            characterController.Move(movement);
            UpdateFaceDirection(moveDirection);
        }
        else if (!hasAttacked)
        {
            AttackPlayer();
        }
    }

    private void ApplyGravity()
    {
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -2f;
        }
        else
        {
            velocity.y += gravity * Time.deltaTime;
        }
        characterController.Move(velocity * Time.deltaTime);
    }

    private void UpdateFaceDirection(Vector3 direction)
    {
        if (direction.x > 0.1f)
        {
            transform.rotation = Quaternion.Euler(0, 0, 0);
        }
        else if (direction.x < -0.1f)
        {
            transform.rotation = Quaternion.Euler(0, 180, 0);
        }
    }

    private void AttackPlayer()
    {
        //死了就不打了
        if (hasAttacked || (PlayerHPController.Instance != null && PlayerHPController.Instance.IsDead)) return;
        hasAttacked = true;
        PlayerHPController.Instance?.TakeDamage(damage);
        Character playerCharacter = FindObjectOfType<Character>();
        if (playerCharacter != null)
        {
            playerCharacter.GetHurtFromPosition(transform.position);
        }

        attackCoroutine = StartCoroutine(ResetAttackAfterDelay(1f));
    }
    private IEnumerator ResetAttackAfterDelay(float delay)
    {
        yield return new WaitForSeconds(delay);
        hasAttacked = false;
    }

    private void OnHealthDeath()
    {
        if (isDead) return;
        isDead = true;

        //增加玩家击杀数
        StatisticsManager.Instance.KillPlus();

        OnDeath();
    }

    public void OnBulletHit(Character shooter, Vector3 hitPoint, float damageAmount = 35f)
    {
        if (isDead) return;
        enemyHealth?.ReduceHealth(damageAmount, hitPoint);

    }

    public void OnDeath()
    {
        if (isDead) return;

        isDead = true;
        moveDirection = Vector3.zero;
        velocity = Vector3.zero;


        if (characterController != null)
            characterController.enabled = false;

        if (enemyCollider != null)
            enemyCollider.enabled = false;

        EnemyRewardSys.Instance?.OnEnemyKilled(IsSpecialEnemy, IsBossEnemy);
        GameEvents.TriggerEnemyKilled(this, IsSpecialEnemy);
        gameObject.SetActive(false);
    }



    public void Revive()
    {
        if (!isDead) return;

        isDead = false;
        hasAttacked = false;
        currentSpeed = baseSpeed;
        moveDirection = Vector3.zero;
        velocity = Vector3.zero;

        if (characterController != null)
        {
            characterController.enabled = true;
        }

        if (enemyCollider != null)
        {
            enemyCollider.enabled = true;
        }

        transform.position = spawnPosition;

        enemyHealth?.ResetHealth();

        gameObject.SetActive(true);
    }

    private void OnEnable()
    {
        if (isDead)
        {
            Revive();
        }
        else
        {
            if (characterController != null)
                characterController.enabled = true;
            if (enemyCollider != null)
                enemyCollider.enabled = true;
        }
    }

    private void OnDisable()
    {
        if (attackCoroutine != null)
        {
            StopCoroutine(attackCoroutine);
            attackCoroutine = null;
        }
        if (deathCoroutine != null)
        {
            StopCoroutine(deathCoroutine);
            deathCoroutine = null;
        }
    }

    private void OnDestroy()
    {
        if (enemyHealth != null)
        {
            enemyHealth.OnDeath -= OnHealthDeath;
        }

        if (attackCoroutine != null)
            StopCoroutine(attackCoroutine);
        if (deathCoroutine != null)
            StopCoroutine(deathCoroutine);
    }
}