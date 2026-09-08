using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CamC : MonoBehaviour
{
    public bool isFollow;
    float offsetZ;
    public Vector3 CamOffset;
    public float HlookFarforwardTriggerDistance;// 触发前视的参数，就是提前看到更远的地方
    public float TriggerThreashold;
    public float resetSpeed = 2;
    public float followSpeed = 5;
    public Transform target;
    public bool lookForward = false;
    Vector3 lastTargetPosition;
    Vector3 curVelocity;
    Vector3 lookAheadpos;

    [Header("缩放设置")]
    public float zoomSpeed = 2f;
    public float minZoomDistance = 3f;
    public float maxZoomDistance = 15f;
    private float currentZoomDistance = 5f;

    [Header("高度设置")]
    public float minHeight = 1f;    
    public float maxHeight = 10f;  

    [Header("X轴角度设置")]
    public float minXRotation = 0f;  
    public float maxXRotation = 60f;  

    [Header("FOV设置")]
    public bool useFovZoom = true; 
    public float minFov = 30f;     
    public float maxFov = 60f;    
    private Camera cam;

    void Start()
    {
        cam = GetComponent<Camera>();
        if (cam == null)
        {
            cam = Camera.main;
        }

        lastTargetPosition = target.position;
        offsetZ = (transform.position - target.position).z;
        currentZoomDistance = Mathf.Abs(offsetZ);
        UpdateCameraRotation();
    }
    private void Update()
    {
        if (!isFollow)
        {
            return;
        }
        HandleZoomInput();

        if (lookForward)
        {
            float xMoveDelta = (target.position - lastTargetPosition).x;
            bool updatLookAheadTarget = Mathf.Abs(xMoveDelta) > TriggerThreashold;
            if (updatLookAheadTarget)
            {
                lookAheadpos = HlookFarforwardTriggerDistance * Vector3.right * Mathf.Sign(xMoveDelta);
                lookAheadpos.z = -3;
            }
            else
            {
                lookAheadpos = Vector3.MoveTowards(lookAheadpos, Vector3.zero, Time.deltaTime * resetSpeed);
            }
        }
        Vector3 aheadTargetpos = target.position + lookAheadpos + Vector3.forward * -currentZoomDistance +
                                new Vector3(CamOffset.x, GetCurrentHeight(), CamOffset.z);
        Vector3 posTemp = Vector3.Lerp(transform.position, aheadTargetpos, Time.deltaTime * followSpeed);
        transform.position = posTemp;
        UpdateCameraRotation();
        lastTargetPosition = target.position;
    }

    private void HandleZoomInput()
    {
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        if (scroll != 0)
        {
            currentZoomDistance = Mathf.Clamp(currentZoomDistance - scroll * zoomSpeed, minZoomDistance, maxZoomDistance);
            if (useFovZoom && cam != null)
            {
                float zoomRatio = Mathf.InverseLerp(minZoomDistance, maxZoomDistance, currentZoomDistance);
                float targetFov = Mathf.Lerp(minFov, maxFov, zoomRatio);
                cam.fieldOfView = targetFov;
            }
        }
    }
    private float GetCurrentHeight()
    {
        float zoomRatio = Mathf.InverseLerp(minZoomDistance, maxZoomDistance, currentZoomDistance);
        return Mathf.Lerp(minHeight, maxHeight, zoomRatio);
    }
    private float GetCurrentXRotation()
    {
        float zoomRatio = Mathf.InverseLerp(minZoomDistance, maxZoomDistance, currentZoomDistance);
        return Mathf.Lerp(minXRotation, maxXRotation, zoomRatio);
    }
    private void UpdateCameraRotation()
    {
        float currentXRotation = GetCurrentXRotation();
        transform.eulerAngles = new Vector3(currentXRotation, 0, 0);
    }
}