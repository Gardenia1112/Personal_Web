using UnityEngine;
using System.Collections;

public class EnemyHealth : MonoBehaviour
{
    public float health;
    public float maxHealth = 100f;
    public System.Action<float> OnHealthChanged;
    public System.Action OnDeath;
    public Material hurtMaterial;
    private Material originalMaterial;
    public Renderer enemyRenderer;
    public float hurtFlashTime = 0.1f;
    public GameObject deathEffect;

    private void Start()
    {
        health = maxHealth;

        if (enemyRenderer == null)
            enemyRenderer = GetComponentInChildren<Renderer>();

        if (enemyRenderer != null)
            originalMaterial = enemyRenderer.material;
    }

    public void ReduceHealth(float amount, Vector3 hitPoint = default(Vector3))
    {
        if (health <= 0) return;

        health = Mathf.Clamp(health - amount, 0, maxHealth);

        StartCoroutine(HurtFlash());
        OnHealthChanged?.Invoke(health);

        if (health <= 0)
        {
            OnDeath?.Invoke();
            HandleDeath();
        }
    }

    private IEnumerator HurtFlash()
    {
        if (enemyRenderer != null && hurtMaterial != null)
        {
            enemyRenderer.material = hurtMaterial;
            yield return new WaitForSeconds(hurtFlashTime);
            enemyRenderer.material = originalMaterial;
        }
    }

    private void HandleDeath()
    {
        if (deathEffect != null)
        {
            Instantiate(deathEffect, transform.position, Quaternion.identity);
        }

    }

    public void ResetHealth()
    {
        health = maxHealth;
        OnHealthChanged?.Invoke(health);
    }
}