using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class EnemySpawner : MonoBehaviour
{
    [Header("生成器基础设置")]
    public GameObject enemyPrefab;
    public float spawnRadius = 10f;
    public int maxEnemies = 10;
    public float spawnInterval = 3f;
    public bool startSpawningOnAwake = false;

    [Header("玩家距离设置")]
    public float activationRange = 20f;
    public float detectionRange = 15f;
    public float stopTrackingRange = 20f;
    public float safeSpawnDistanceFromPlayer = 5f;

    private List<GameObject> enemyPool = new List<GameObject>();
    private Transform player;
    private bool isActive = false;
    private float spawnCooldown = 0f;

    private void Start()
    {
        InitializeSpawner();
    }

    private void Update()
    {
        if (player == null)
        {
            FindPlayer();
            return;
        }

        UpdateSpawnerState();
        UpdateCooldown();
    }

    private void InitializeSpawner()
    {
        FindPlayer();

        for (int i = 0; i < maxEnemies; i++)
        {
            CreateEnemyInPool();
        }

        if (startSpawningOnAwake)
        {
            ActivateSpawner();
        }
    }

    private void CreateEnemyInPool()
    {
        if (enemyPrefab == null) return;

        GameObject enemy = Instantiate(enemyPrefab, transform.position, Quaternion.identity, transform);
        enemy.SetActive(false);
        enemyPool.Add(enemy);
    }

    private void UpdateSpawnerState()
    {
        float distanceToPlayer = Vector3.Distance(transform.position, player.position);

        if (!isActive)
        {
            if (distanceToPlayer <= activationRange)
            {
                ActivateSpawner();
            }
        }
        else
        {
            if (distanceToPlayer > activationRange + 5f)
            {
                DeactivateSpawner();
            }
            HandleSpawning();
        }
    }

    private void HandleSpawning()
    {
        if (spawnCooldown <= 0f)
        {
            SpawnEnemy();
            spawnCooldown = spawnInterval;
        }
    }

    private void UpdateCooldown()
    {
        if (spawnCooldown > 0f)
        {
            spawnCooldown -= Time.deltaTime;
        }
    }

    private void SpawnEnemy()
    {
        GameObject enemy = GetAvailableEnemyFromPool();
        if (enemy == null) return;

        Vector3 spawnPosition = GetSafeSpawnPosition();
        if (spawnPosition == Vector3.zero) return;

        enemy.transform.position = spawnPosition;

        Enemy enemyComponent = enemy.GetComponent<Enemy>();
        if (enemyComponent != null)
        {
            enemyComponent.player = player;
            GameEvents.TriggerEnemySpawn(enemyComponent);
        }

        enemy.SetActive(true);
    }

    private GameObject GetAvailableEnemyFromPool()
    {
        foreach (GameObject enemy in enemyPool)
        {
            if (!enemy.activeInHierarchy)
            {
                return enemy;
            }
        }
        return null;
    }

    private Vector3 GetSafeSpawnPosition()
    {
        Vector3 spawnPosition = Vector3.zero;
        int attempts = 0;
        int maxSpawnAttempts = 10;

        while (attempts < maxSpawnAttempts)
        {
            Vector2 randomCircle = Random.insideUnitCircle * spawnRadius;
            spawnPosition = transform.position + new Vector3(randomCircle.x, 0, randomCircle.y);

            if (player != null && Vector3.Distance(spawnPosition, player.position) < safeSpawnDistanceFromPlayer)
            {
                attempts++;
                continue;
            }

            if (IsSpawnPositionValid(spawnPosition))
            {
                return spawnPosition;
            }

            attempts++;
        }

        return Vector3.zero;
    }

    private bool IsSpawnPositionValid(Vector3 position)
    {
        Collider[] colliders = Physics.OverlapSphere(position, 1f);
        foreach (Collider collider in colliders)
        {
            if (!collider.isTrigger && !collider.CompareTag("Ground"))
            {
                return false;
            }
        }
        return true;
    }

    public void ActivateSpawner()
    {
        if (isActive) return;
        isActive = true;
        spawnCooldown = 0f;
    }

    public void DeactivateSpawner()
    {
        if (!isActive) return;
        isActive = false;
        spawnCooldown = 0f;
    }

    private void FindPlayer()
    {
        GameObject playerObj = GameObject.FindGameObjectWithTag("Player");
        if (playerObj != null)
        {
            player = playerObj.transform;
        }
    }
}