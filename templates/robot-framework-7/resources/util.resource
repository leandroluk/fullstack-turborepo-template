*** Settings ***
Documentation       Util resource file with shared keywords

Library             Collections
Library             String
Library             RequestsLibrary
Library             ImapLibrary2
Library             DatabaseLibrary
Variables           ../variables.py


*** Variables ***
${REGEX_EMAIL_OTP} =    id="otp"[^>]*>\\s*([a-zA-Z0-9]{6})\\s*</span>


*** Keywords ***
Postgres Connect
    [Documentation]    Centralizes the database connection by parsing the URL
    ${p} =    Evaluate
    ...    urllib.parse.urlparse($ROBOT_DATABASE_POSTGRES_URL)
    ...    modules=urllib.parse
    Connect To Database
    ...    db_module=psycopg2
    ...    db_name=${{$p.path[1:]}}
    ...    db_user=${{$p.username}}
    ...    db_password=${{$p.password}}
    ...    db_host=${{$p.hostname}}
    ...    db_port=${{$p.port}}

Postgres Disconnect
    [Documentation]    Centralizes the database disconnection
    Disconnect From Database

Postgres Query
    [Documentation]    Executes a query and returns the result
    [Arguments]    ${query}
    ${result} =    Query    ${query}    return_dict=True
    RETURN    ${result}

Postgres Execute
    [Documentation]    Executes a query and returns the result
    [Arguments]    ${query}
    Execute Sql String    ${query}

Postgres Delete User By Email
    [Documentation]    Deletes a user from the database using their email address
    [Arguments]    ${email}
    Postgres Execute    DELETE FROM "tb_user" WHERE email = '${email}'

Postgres Create Test User
    [Documentation]    Creates a test user in the database with password "Test@123"
    ${id} =       Evaluate    uuid.uuid4()             modules=uuid
    ${email} =    Postgres Create Test User Step Query User    ${id}
    Postgres Create Test User Step Query Profile    ${id}
    Postgres Create Test User Step Query Kyc    ${id}
    RETURN    ${email}

Postgres Create Test User Step Query User
    [Documentation]    Creates a test user in the database with password "Test@123"
    [Arguments]    ${id}
    ${email} =    Evaluate    faker.Faker().email()    modules=faker
    ${query_user} =    Catenate
    ...    INSERT INTO "tb_user" ("id", "created_at", "updated_at", "deleted_at", "email", "password_hash", "role",
    ...    "status") VALUES ('${id}', NOW(), NOW(), NULL, '${email}',
    ...    'h3bxCOJHqx4rMjBCwEnCZkB8gfutQb3h6N_Bu2b9Jn4', 'USER', 'active');
    Postgres Execute    ${query_user}
    RETURN    ${email}

Postgres Create Test User Step Query Profile
    [Documentation]    Creates a test user in the database with password "Test@123"
    [Arguments]    ${user_id}
    ${profile_id} =    Evaluate    uuid.uuid4()    modules=uuid
    ${name} =    Evaluate    faker.Faker().name()    modules=faker
    ${query_profile} =    Catenate
    ...    INSERT INTO "tb_profile" ("id", "user_id", "updated_at", "name",
    ...    "language", "timezone", "two_factor_enabled")
    ...    VALUES ('${profile_id}', '${user_id}', NOW(), '${name}', 'en', 'UTC', false);
    Postgres Execute    ${query_profile}

Postgres Create Test User Step Query Kyc
    [Documentation]    Creates a test user in the database with password "Test@123"
    [Arguments]    ${user_id}
    ${kyc_id} =    Evaluate    uuid.uuid4()    modules=uuid
    ${query_kyc} =    Catenate
    ...    INSERT INTO "tb_kyc" ("id", "user_id", "created_at", "updated_at", "status", "level", "verified_at")
    ...    VALUES ('${kyc_id}', '${user_id}', NOW(), NOW(), 'PENDING', 'TIER_1', NULL);
    Postgres Execute    ${query_kyc}

Mailbox Connect
    [Documentation]    Centralizes the mailbox opening
    Open Mailbox
    ...    host=${ROBOT_MAILER_IMAP_HOST}
    ...    port=${ROBOT_MAILER_IMAP_PORT}
    ...    user=${ROBOT_MAILER_IMAP_USERNAME}
    ...    password=${ROBOT_MAILER_IMAP_PASSWORD}

Mailbox Get OTP From Email
    [Documentation]    Retrieves the OTP code from the email with retry logic
    [Arguments]    ${recipient_email}    ${max_attempts}=15    ${wait_between_attempts}=5s
    Log    Starting email retrieval for: ${recipient_email}    level=INFO
    VAR    ${max_attempts_int} =    ${{int($max_attempts)}}
    VAR    ${range_end} =    ${{${max_attempts_int} + 1}}
    Sleep    3s
    FOR    ${attempt}    IN RANGE    1    ${range_end}
        Log    Attempt ${attempt}/${max_attempts} to retrieve email    level=INFO
        TRY
            ${otp_code} =    Mailbox Try Get OTP    ${recipient_email}
            RETURN    ${otp_code}
        EXCEPT    AS    ${error}
            Log    Attempt ${attempt} failed: ${error}    level=WARN
            Mailbox Handle Failed OTP Attempt
            ...    ${attempt}
            ...    ${max_attempts_int}
            ...    ${wait_between_attempts}
            ...    ${error}
        END
    END

Mailbox Open And Wait For Email
    [Documentation]    Opens the mailbox and waits for a specific recipient email
    [Arguments]    ${recipient_email}
    Mailbox Connect
    ${emails} =    Wait For Email
    ...    sender=${ROBOT_MAILER_SMTP_FROM}
    ...    recipient=${recipient_email}
    ...    timeout=10
    RETURN    ${emails}

Mailbox Try Get OTP
    [Documentation]    Orchestrates mailbox access and OTP extraction
    [Arguments]    ${recipient_email}
    TRY
        ${email_index} =    Mailbox Open And Wait For Email    ${recipient_email}
        IF    $email_index == $None or $email_index == ""
            Fail    No email found yet
        END
        ${email_body} =    Mailbox Get Content From Multipart Email    ${email_index}
        ${otp_code} =    Mailbox Extract OTP From Content    ${email_body}
        Delete Email    ${email_index}
        RETURN    ${otp_code}
    FINALLY
        Run Keyword And Ignore Error    Close Mailbox
    END

Mailbox Get Content From Multipart Email
    [Documentation]    Retrieves the OTP code from the email with retry logic
    [Arguments]    ${email_index}
    ${status} =    Walk Multipart Email    ${email_index}
    VAR    ${extracted_body} =    ${EMPTY}
    WHILE    $status != False
        ${type} =    Get Multipart Content Type
        ${current_payload} =    Get Multipart Payload    decode=True
        IF    "text/html" in $type
            VAR    ${extracted_body} =    ${current_payload}
            BREAK
        END
        ${status} =    Walk Multipart Email    ${email_index}
    END
    IF    $extracted_body == ""
        VAR    ${extracted_body} =    Get Email Body    ${email_index}
    END
    RETURN    ${extracted_body}

Mailbox Extract OTP From Content
    [Documentation]    Parses the email body to find the OTP code using Regex
    [Arguments]    ${content}
    ${matches} =    Get Regexp Matches    ${content}    ${REGEX_EMAIL_OTP}    1
    ${match_count} =    Get Length    ${matches}
    Should Be True    ${match_count} > 0    msg=OTP pattern not found in email body
    RETURN    ${matches[0]}

Mailbox Handle Failed OTP Attempt
    [Documentation]    Handles failed OTP attempts with retry logic
    [Arguments]    ${attempt}    ${max_attempts}    ${wait_time}    ${error}
    IF    $attempt == $max_attempts
        Fail    Failed to retrieve OTP after ${max_attempts} attempts. Last error: ${error}
    END
    Log    Waiting ${wait_time} before next attempt...    level=INFO
    Sleep    ${wait_time}

Mailbox Delete All Emails
    [Documentation]    Cleans the inbox to avoid state interference
    TRY
        Mailbox Connect
        Run Keyword And Return Status    Delete All Emails
    FINALLY
        Run Keyword And Ignore Error    Close Mailbox
    END

Auth Login With Credentials
    [Documentation]    Logs in with credentials and returns auth data
    [Arguments]    ${email}    ${password}    ${expected_status}=200
    VAR    &{payload} =    email=${email}    password=${password}
    ${response} =    POST On Session    api_session    auth/login/credential    json=${payload}    expected_status=${expected_status}
    RETURN    ${response.json()}

Url Extract Query Param
    [Documentation]    Extracts a query parameter from a URL
    [Arguments]    ${url}    ${name}
    ${parsed_url} =    Evaluate    urllib.parse.urlparse($url)    modules=urllib.parse
    ${query_params} =    Evaluate    urllib.parse.parse_qs($parsed_url.query)    modules=urllib.parse
    ${value} =    Get From Dictionary    ${query_params}    ${name}    default=${None}
    RETURN    ${value}[0]
