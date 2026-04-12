*** Settings ***
Documentation       E2E tests for the Control API system health status.

Resource            ../../resources/util.resource

Suite Setup         Setup Test Suite
Suite Teardown      Teardown Test Suite


*** Variables ***
${HEALTH_PATH}      system/health


*** Test Cases ***
Verify API System Health Status
    [Documentation]    Verify API system health status
    ${json}=    Do Health Request
    Validate Health Request    ${json}


*** Keywords ***
Setup Test Suite
    [Documentation]    Initializes API session and cleans IMAP inbox
    Create Session    api_session    ${ROBOT_URL}    verify=True
    Mailbox Delete All Emails

Teardown Test Suite
    [Documentation]    Closes all sessions
    Delete All Sessions

Do Health Request
    [Documentation]    Performs the health check request and returns the JSON body
    Create Session    api_session    ${ROBOT_URL}    verify=True
    ${response}=    GET On Session    api_session    ${HEALTH_PATH}    expected_status=200
    RETURN    ${response.json()}

Validate Health Request
    [Documentation]    Validates the main health keys
    [Arguments]    ${json}
    # Validate Root Keys
    Dictionary Should Contain Key    ${json}    uptime
    Should Not Be Empty    ${json}[uptime]    msg=Uptime report is empty
