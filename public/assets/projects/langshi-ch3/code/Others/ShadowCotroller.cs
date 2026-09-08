// URPShadowProjector.cs - URP专用的投影控制器
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

public class URPShadowProjector : MonoBehaviour
{
    [Header("URP Decal投影设置")]
    public DecalProjector decalProjector;
    public Transform target;
    public LayerMask groundMask = 1;

    [Header("动态效果")]
    public float sizeSmoothness = 0.1f;
    public float maxSize = 2f;
    public float minSize = 0.5f;
    public float maxDistance = 8f;
    public AnimationCurve sizeCurve = AnimationCurve.Linear(0, 1, 1, 0.3f);

    private float currentSize;
    private Material decalMaterial;

    void Start()
    {
        if (target == null)
            target = transform.parent;

        if (decalProjector == null)
            decalProjector = GetComponent<DecalProjector>();

        // 创建动态材质实例
        if (decalProjector != null && decalProjector.material != null)
        {
            decalMaterial = new Material(decalProjector.material);
            decalProjector.material = decalMaterial;
        }

        currentSize = maxSize;
    }

    void Update()
    {
        if (target == null || decalProjector == null) return;

        UpdateProjectorPosition();
        UpdateProjectorSize();
        UpdateProjectorOpacity();
    }

    void UpdateProjectorPosition()
    {
        // 将Decal投影器放在角色位置
        transform.position = target.position;

        // 检测地面高度来调整投影位置
        RaycastHit hit;
        if (Physics.Raycast(target.position, Vector3.down, out hit, maxDistance, groundMask))
        {
            // 调整投影器高度以贴合地面
            Vector3 position = transform.position;
            position.y = hit.point.y + 0.1f; // 稍微高于地面
            transform.position = position;
        }
    }

    void UpdateProjectorSize()
    {
        // 检测角色离地高度
        RaycastHit hit;
        float height = maxDistance;
        if (Physics.Raycast(target.position, Vector3.down, out hit, maxDistance, groundMask))
        {
            height = hit.distance;
        }

        // 根据高度调整投影大小
        float heightFactor = Mathf.Clamp01(height / maxDistance);
        float targetSize = Mathf.Lerp(maxSize, minSize, sizeCurve.Evaluate(heightFactor));
        currentSize = Mathf.Lerp(currentSize, targetSize, sizeSmoothness);

        // 更新Decal投影器大小
        decalProjector.size = new Vector3(currentSize, currentSize, decalProjector.size.z);
    }

    void UpdateProjectorOpacity()
    {
        if (decalMaterial == null) return;

        // 根据高度调整透明度
        RaycastHit hit;
        float height = maxDistance;
        if (Physics.Raycast(target.position, Vector3.down, out hit, maxDistance, groundMask))
        {
            height = hit.distance;
        }

        float opacity = Mathf.Lerp(1f, 0.2f, height / maxDistance);
        decalMaterial.SetFloat("_Alpha", opacity);
    }

    void OnDestroy()
    {
        // 清理动态材质
        if (decalMaterial != null)
        {
            DestroyImmediate(decalMaterial);
        }
    }

#if UNITY_EDITOR
    void OnDrawGizmosSelected()
    {
        if (target == null) return;

        // 可视化调试
        Gizmos.color = Color.blue;
        Gizmos.DrawLine(target.position, target.position + Vector3.down * maxDistance);

        if (decalProjector != null)
        {
            Gizmos.color = Color.green;
            Gizmos.DrawWireCube(transform.position, new Vector3(decalProjector.size.x, 0.1f, decalProjector.size.y));
        }
    }
#endif
}