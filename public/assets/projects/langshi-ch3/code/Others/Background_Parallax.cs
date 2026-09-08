using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Background_Parallax : MonoBehaviour
{
    [Tooltip("视差效果乘数：越近的层，这个值应该越大。")]
    public float parallaxEffectMultiplier = 0.5f;
    
    [Tooltip("平滑移动的插值速度")]
    public float smoothSpeed = 5f;
    
    [Tooltip("是否启用Y轴视差效果")]
    public bool enableYParallax = true;

    public Transform targetObject;
    private Vector3 lastTargetPosition;
    private Vector3 targetPosition;

    void Start()
    {
        lastTargetPosition = targetObject.position;
        targetPosition = transform.position;
    }

    void LateUpdate()
    {
        Vector3 deltaMovement = targetObject.position - lastTargetPosition;
        
        float parallaxX = deltaMovement.x * parallaxEffectMultiplier;
        float parallaxY = enableYParallax ? deltaMovement.y * parallaxEffectMultiplier : 0f;
        
        targetPosition += new Vector3(parallaxX, parallaxY, 0);
        
        transform.position = Vector3.Lerp(transform.position, targetPosition, smoothSpeed * Time.deltaTime);
        
        lastTargetPosition = targetObject.position;
    }
}