<?php

namespace App\Enums;

enum SecurityEventType: string
{
    case AuthLoginSuccess = 'AUTH_LOGIN_SUCCESS';
    case AuthLoginFailure = 'AUTH_LOGIN_FAILURE';
    case AuthLogout = 'AUTH_LOGOUT';
    case AuthRateLimit = 'AUTH_RATE_LIMIT';
    case AccessDenied = 'ACCESS_DENIED';
    case SuspiciousRequest = 'SUSPICIOUS_REQUEST';
    case HoneypotTriggered = 'HONEYPOT_TRIGGERED';
    case UploadRejected = 'UPLOAD_REJECTED';
    case CrossTenantAttempt = 'CROSS_TENANT_ATTEMPT';
    case AdminAction = 'ADMIN_ACTION';
}
