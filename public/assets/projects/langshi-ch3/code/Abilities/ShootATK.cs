using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

public class ShootATK : Ability_Base
{
    [Header("�������")]
    public float shootRange = 10f;
    public LayerMask enemyLayerMask = 1 << 9;
    public Transform shootPoint;
    public AudioClip shootSound;
    public AudioSource audioSource;
    public float shootCooldown = 0.3f;
    private float nextShootTime = 0f;
    public int damage = 25;
    public int maxAmmo = 8;
    public int currentAmmo = 8;
    private bool isReloading = false;
    public float reloadTime = 2f;
    private bool isShooting = false;
    private CharacterAnimatorController animatorController;

    private Coroutine attackCoroutine;

    private Queue<GameObject> MuzzleFlashPool = new Queue<GameObject>();
    private Queue<GameObject> HitEffectPool = new Queue<GameObject>();

    protected override void Init()
    {
        base.Init();
        animatorController = character.GetComponent<CharacterAnimatorController>();
        if (audioSource == null)
            audioSource = GetComponent<AudioSource>();
        if (audioSource == null)
            audioSource = gameObject.AddComponent<AudioSource>();

        if (shootPoint == null)
        {
            shootPoint = transform.Find("ShootPoint");
            if (shootPoint == null)
            {
                GameObject shootPointObj = new GameObject("ShootPoint");
                shootPoint = shootPointObj.transform;
                shootPoint.SetParent(transform);
                shootPoint.localPosition = new Vector3(0.5f, 0.5f, 0);
            }
        }
        enemyLayerMask = LayerMask.GetMask("Enemy");
    }

    protected override void UseInput()
    {
        if (isReloading) return;

        if (Input.GetMouseButtonDown(0) && Time.time >= nextShootTime &&
            character.CanPerformAction() && currentAmmo > 0&&UIManager.Instance.GetCurrentPanel().PanelName=="InGame_Main_Combat")
        {
            StartShoot();
        }

        if (Input.GetKeyDown(KeyCode.R) && currentAmmo < maxAmmo)
        {
            StartReload();
        }
    }
    private void OnReloadInsertAmmo()
    {
        currentAmmo = maxAmmo;
        GameEvents.TriggerBulletChanged(currentAmmo);
    }
    private void StartShoot()
    {
        if (!character.CanPerformAction()) return;

        if (character.characterCondition.CurrentState != CharacterStates.CharacterCondition.Normal)
            return;

        isShooting = true;
        nextShootTime = Time.time + shootCooldown;
        currentAmmo--;
        GameEvents.TriggerBulletChanged(currentAmmo);
        GameEvents.TriggerPlayerAction("attacked");
        StartShootAnimation();
        PlayShootEffects();
        StartCoroutine(YieldUntilFinish(animatorController.GetComponent<Animator>(), "Player_Attack", EndShootAnimation));

        if (currentAmmo <= 0)
        {
            StartReload();
        }

        character.StartAttack();

        if (shootPoint == null)
        {
            return;
        }

        if (shootSound != null && audioSource != null)
        {
            audioSource.PlayOneShot(shootSound);
        }

        Vector3 shootDirection = shootPoint.forward;
        PerformRaycast(shootDirection);

        if (attackCoroutine != null)
            StopCoroutine(attackCoroutine);
    }

    private void PlayShootEffects()
    {
        if (shootSound != null)
            audioSource.PlayOneShot(shootSound);
    }

    private void StartReload()
    {
        GameEvents.TriggerPlayerAction("reloaded");
        if (isReloading || currentAmmo == maxAmmo) return;

        isReloading = true;
        StartReloadAnimation();
        StartCoroutine(YieldUntilFinish(animatorController.GetComponent<Animator>(),"Player_Change",EndReloadAnimation));

    }
    public void EndReloadAnimation()
    {
        currentAmmo = maxAmmo;
        isReloading = false;
        animatorController.EndReloadAnimation();
        GameEvents.TriggerBulletChanged(currentAmmo);
    }
    public void EndShootAnimation()
    {
        animatorController.EndShootAnimation();
    }

    public void StartShootAnimation()
    {
        animatorController.StartShootAnimation();
    }

    public void StartReloadAnimation()
    {
        animatorController.StartReloadAnimation();
    }
    public IEnumerator YieldUntilFinish(Animator anim, string aniName, UnityAction action)
    {
        yield return new WaitUntil(() =>
        {
            AnimatorStateInfo stateInfo = anim.GetCurrentAnimatorStateInfo(0);
            return stateInfo.IsName(aniName) && stateInfo.normalizedTime >= 1.0f;
        });
        action();
    }

    public override void Execute()
    {
        base.Execute();

        if (!isShooting && currentAmmo <= 0 && !isReloading)
        {
            StartReload();
        }
    }

    void PerformRaycast(Vector3 direction)
    {
        RaycastHit hit;
        bool hitSomething = Physics.Raycast(
            shootPoint.position,
            direction,
            out hit,
            shootRange,
            enemyLayerMask
        );

        if (hitSomething)
        {
            OnHitEnemy(hit);
        }
    }

    void OnHitEnemy(RaycastHit hit)
    {
        Enemy enemy = FindEnemyInHierarchy(hit.collider);
        if (enemy != null)
        {
            GameEvents.TriggerDamageDealt(damage, enemy.gameObject);
            enemy.OnBulletHit(character, hit.point);
        }
    }

    Enemy FindEnemyInHierarchy(Collider collider)
    {
        Transform current = collider.transform;
        while (current != null)
        {
            Enemy enemy = current.GetComponent<Enemy>();
            if (enemy != null)
            {
                return enemy;
            }
            current = current.parent;
        }

        Enemy rootEnemy = collider.transform.root.GetComponent<Enemy>();
        if (rootEnemy != null)
        {
            return rootEnemy;
        }

        GameObject enemyRoot = GameObject.Find("Enemy");
        if (enemyRoot != null)
        {
            Enemy foundEnemy = enemyRoot.GetComponent<Enemy>();
            if (foundEnemy != null) return foundEnemy;
        }

        return null;
    }

    void OnGUI()
    {
        // ��ʾ��ҩUI
    }

    void OnDrawGizmosSelected()
    {
        if (shootPoint != null)
        {
            Gizmos.color = Color.red;
            Vector3 direction = shootPoint.forward;
            Gizmos.DrawRay(shootPoint.position, direction * shootRange);

            Gizmos.color = Color.yellow;
            Gizmos.DrawSphere(shootPoint.position, 0.1f);
        }
    }
    

}
