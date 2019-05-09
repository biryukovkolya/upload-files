'use strict';
const loadScript = (url) => {
    return new Promise((resolve) => {
        let script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        document.querySelector('head').appendChild(script);
        script.onload = () => {
            resolve();
        }
    })
};

class JiraScript {
    constructor() {
        JiraScript.$body = $('body');
        JiraScript.$selectProjects = '';
        JiraScript.$progress = '';
        JiraScript.$tableWrapper = '';
        JiraScript.getRoleIdReg = /.+\/([0-9]+)/i;
        JiraScript.dateReg = /([0-9]{1,2})[.-\/]([0-9]{1,2})[.-\/]([0-9]{2,4})/i;
    }

    setCss() {
        let css = '<style>' +
            'body {' +
            '    overflow: hidden;' +
            '}' +
            '.jira-script {' +
            '    background-color: #fff;' +
            '    box-shadow: #000;' +
            '    box-sizing: border-box;' +
            '    display: block;' +
            '    height: 100%;' +
            '    line-height: 1.5;' +
            '    overflow: auto;' +
            '    position: fixed;' +
            '    top: 0;' +
            '    width: 100%;' +
            '    z-index: 99999;' +
            '}' +
            '.row {' +
            '    display: flex;' +
            '    flex-wrap: wrap;' +
            '    margin-right: -15px;' +
            '    margin-left: -15px;' +
            '}' +
            '.row>[class*=col-] {' +
            '    box-sizing: border-box;' +
            '    padding-right: 15px;' +
            '    padding-left: 15px;' +
            '    position: relative;' +
            '    width: auto;' +
            '}' +
            '.col-auto {' +
            '    flex: 0 0 auto;' +
            '    max-width: none;' +
            '    min-height: 1px;' +
            '}' +
            '.col-6{' +
            '    flex: 0 0 50%;' +
            '    max-width: 50%;' +
            '}' +
            '.col-12 {' +
            '    flex: 0 0 100%;' +
            '    max-width: 100%;' +
            '}' +
            '.card {' +
            '    background-color: #fff;' +
            '    background-clip: border-box;' +
            '    border: 1px solid rgba(0, 0, 0, 0.125);' +
            '    border-radius: 0.25rem;' +
            '    display: flex;' +
            '    flex-direction: column;' +
            '    min-width: 0;' +
            '    position: relative;' +
            '    word-wrap: break-word;' +
            '}' +
            '.card-header {' +
            '    background-color: rgba(0, 0, 0, 0.03);' +
            '    border-bottom: 1px solid rgba(0, 0, 0, 0.125);' +
            '    margin-bottom: 0;' +
            '    padding: 0.75rem 1.25rem;' +
            '}' +
            '.card-header:first-child {' +
            '    border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;' +
            '}' +
            '.card-body {' +
            '    flex: 1 1 auto;' +
            '    padding: 1.25rem;' +
            '}' +
            '.table-striped {' +
            '    border-collapse: collapse;' +
            '    max-width: 100%;' +
            '    width: 100%;' +
            '}' +
            '.table-striped td, .table-striped th {' +
            '    border-top: 1px solid #dee2e6;' +
            '    padding: .75rem;' +
            '    vertical-align: middle;' +
            '}' +
            '.table-striped thead th {' +
            '    border-bottom: 5px solid #dee2e6;' +
            '    font-size: inherit;' +
            '    font-weight: bold;' +
            '    text-align: center;' +
            '}' +
            '.table-striped tbody tr:nth-of-type(odd) {' +
            '    background-color: rgba(0, 0, 0, .05);' +
            '}' +
            '.table-active > td,' +
            '.table-active > th {' +
            '    background-color: rgba(0, 0, 0, .075)' +
            '}' +
            '.table-total > td,' +
            '.table-total > th {' +
            '    border-top: 5px solid #dee2e6;' +
            '}' +
            '.table-striped tbody tr:nth-of-type(odd) {' +
            '    background-color: rgba(0, 0, 0, .05);' +
            '}' +
            '.progress {' +
            '    background-color: #e9ecef;' +
            '    border-radius: .25rem;' +
            '    display: flex;' +
            '    font-size: .75rem;' +
            '    height: 2rem;' +
            '    overflow: hidden;' +
            '}' +
            '.progress-bar {' +
            '    background-color: #007bff;' +
            '    background-image: linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);' +
            '    background-size: 1rem 1rem;' +
            '    color: #fff;' +
            '    text-align: center;' +
            '    width: 100%;' +
            '    white-space: nowrap;' +
            '    transition: width .6s ease;' +
            '}' +
            '.progress-bar-animated {' +
            '    animation: progress-bar 1s linear infinite;' +
            '}' +
            'label {' +
            '    display: inline-block;' +
            '    margin-bottom: .5rem;' +
            '}' +
            '.form-group {' +
            '    margin-bottom: 1rem;' +
            '}' +
            '.form-control {' +
            '    border-radius: .25rem;' +
            '    background-color: #fff;' +
            '    background-clip: padding-box;' +
            '    border: 1px solid #ced4da;' +
            '    box-sizing: border-box;' +
            '    color: #495057;' +
            '    display: block;' +
            '    font-size: 1rem;' +
            '    font-weight: 400;' +
            '    height: calc(1.5em + .75rem + 2px);' +
            '    line-height: 1.5;' +
            '    padding: .375rem .75rem;' +
            '    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;' +
            '    width: 100%;' +
            '}' +
            '.form-control:focus {' +
            '    background-color: #fff;' +
            '    border-color: #80bdff;' +
            '    box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);' +
            '    color: #495057;' +
            '    outline: 0;' +
            '}' +
            'textarea.form-control {' +
            '    height: auto;' +
            '}' +
            '.form-control:disabled,' +
            '.form-control[readonly] {' +
            '    background-color: #e9ecef;' +
            '    cursor: not-allowed;' +
            '    opacity: 1;' +
            '}' +
            '.btn {' +
            '    border-radius: 0.25rem;' +
            '    border: 1px solid transparent;' +
            '    cursor: pointer;' +
            '    display: inline-block;' +
            '    font-size: 1rem;' +
            '    font-weight: 400;' +
            '    line-height: 1.5;' +
            '    padding: 0.375rem 0.75rem;' +
            '    text-align: center;' +
            '    user-select: none;' +
            '    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;' +
            '    vertical-align: middle;' +
            '    white-space: nowrap;' +
            '}' +
            '.btn:hover, .btn:focus {' +
            '    text-decoration: none;' +
            '}' +
            '.btn:focus, .btn.focus {' +
            '    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);' +
            '    outline: 0;' +
            '}' +
            '.btn.disabled, .btn:disabled {' +
            '    cursor: not-allowed;' +
            '    opacity: 0.65;' +
            '}' +
            '.btn-primary {' +
            '    color: #fff;' +
            '    background-color: #007bff;' +
            '    border-color: #007bff;' +
            '}' +
            '.btn-primary:hover {' +
            '    color: #fff;' +
            '    background-color: #0069d9;' +
            '    border-color: #0062cc;' +
            '}' +
            '.btn-primary:focus, .btn-primary.focus {' +
            '    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);' +
            '}' +
            '.btn-primary.disabled, .btn-primary:disabled {' +
            '    color: #fff;' +
            '    background-color: #007bff;' +
            '    border-color: #007bff;' +
            '}' +
            '.btn-primary:not(:disabled):not(.disabled):active, .btn-primary:not(:disabled):not(.disabled).active {' +
            '    color: #fff;' +
            '    background-color: #0062cc;' +
            '    border-color: #005cbf;' +
            '}' +
            '.btn-primary:not(:disabled):not(.disabled):active:focus, .btn-primary:not(:disabled):not(.disabled).active:focus {' +
            '    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.5);' +
            '}' +
            '.custom-control {' +
            '    display: block;' +
            '    min-height: 1.5rem;' +
            '    padding-left: 1.5rem;' +
            '    position: relative;' +
            '}' +
            '.custom-control-inline {' +
            '    display: inline-flex;' +
            '    margin-right: 1rem;' +
            '}' +
            '.custom-control-input {' +
            '    opacity: 0;' +
            '    position: absolute;' +
            '    z-index: -1;' +
            '}' +
            '.custom-control-input:checked ~ .custom-control-label::before {' +
            '    color: #fff;' +
            '    background-color: #007bff;' +
            '}' +
            '.custom-control-input:focus ~ .custom-control-label::before {' +
            '    box-shadow: 0 0 0 1px #fff, 0 0 0 0.2rem rgba(0, 123, 255, 0.25);' +
            '}' +
            '.custom-control-input:active ~ .custom-control-label::before {' +
            '    color: #fff;' +
            '    background-color: #b3d7ff;' +
            '}' +
            '.custom-control-input:disabled ~ .custom-control-label {' +
            '    color: #6c757d;' +
            '}' +
            '.custom-control-input:disabled ~ .custom-control-label::before {' +
            '    background-color: #e9ecef;' +
            '}' +
            '.custom-control-label {' +
            '    cursor: pointer;' +
            '    margin-bottom: 0;' +
            '    position: relative;' +
            '}' +
            '.custom-control-label::before {' +
            '    background-color: #dee2e6;' +
            '    content: "";' +
            '    display: block;' +
            '    left: -1.5rem;' +
            '    pointer-events: none;' +
            '    position: absolute;' +
            '    top: .25rem;' +
            '    height: 1rem;' +
            '    width: 1rem;' +
            '    user-select: none;' +
            '}' +
            '.custom-control-label::before,' +
            '.custom-select {' +
            '    transition: background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;' +
            '}' +
            '.custom-control-label::after {' +
            '    background-position: center center;' +
            '    background-repeat: no-repeat;' +
            '    background-size: 50% 50%;' +
            '    content: "";' +
            '    display: block;' +
            '    height: 1rem;' +
            '    left: -1.5rem;' +
            '    position: absolute;' +
            '    top: .25rem;' +
            '    width: 1rem;' +
            '}' +
            '.custom-radio .custom-control-label::before {' +
            '    border-radius: 50%;' +
            '}' +
            '.custom-control-input:checked ~ .custom-control-label::before {' +
            '    background-color: #007bff;' +
            '}' +
            '.custom-radio .custom-control-input:checked ~ .custom-control-label::after {' +
            '    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'%3E%3Ccircle r=\'3\' fill=\'%23fff\'/%3E%3C/svg%3E");' +
            '}' +
            '.custom-radio .custom-control-input:disabled:checked ~ .custom-control-label::before {' +
            '    background-color: rgba(0, 123, 255, 0.5);' +
            '}' +
            '.custom-radio .custom-control-input:disabled:checked ~ .custom-control-label {' +
            '    cursor: not-allowed' +
            '}' +
            '.custom-select {' +
            '    appearance: none;' +
            '    -webkit-appearance: none;' +
            '    -moz-appearance: none;' +
            '    background: #fff url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 5\'%3E%3Cpath fill=\'%23343a40\' d=\'M2 0L0 2h4zm0 5L0 3h4z\'/%3E%3C/svg%3E") no-repeat right 0.75rem center;' +
            '    background-size: 8px 10px;' +
            '    border: 1px solid #ced4da;' +
            '    border-radius: 0.25rem;' +
            '    color: #495057;' +
            '    cursor: pointer;' +
            '    display: inline-block;' +
            '    height: calc(1.5em + .75rem + 2px);;' +
            '    line-height: 1.5;' +
            '    padding: 0.375rem 1.75rem 0.375rem 0.75rem;' +
            '    vertical-align: middle;' +
            '    width: 100%;' +
            '}' +
            '.custom-select:focus {' +
            '    border-color: #80bdff;' +
            '    outline: 0;' +
            '    box-shadow: 0 0 0 0.2rem rgba(128, 189, 255, 0.5);' +
            '}' +
            '.custom-select.disabled,' +
            '.custom-select:disabled {' +
            '    background-color: #e9ecef;' +
            '    color: #6c757d;' +
            '    cursor: not-allowed' +
            '}' +
            '.d-none {' +
            '    display: none !important;' +
            '}' +
            '.mt-1 {' +
            '    margin-top: 1rem !important;' +
            '}' +
            '.p-1 {' +
            '    padding: 1rem !important;' +
            '}' +
            '.c-success {' +
            '    color: #28a745 !important;' +
            '}' +
            '.c-danger {' +
            '    color: #dc3545 !important;' +
            '}' +
            '.t-center {' +
            '    text-align: center !important;' +
            '}' +
            '.t-left {' +
            '    text-align: left !important;' +
            '}' +
            '.t-right {' +
            '    text-align: right !important;' +
            '}' +
            '@keyframes progress-bar {' +
            '    from {' +
            '        background-position: 1rem 0;' +
            '    }' +
            '    to {' +
            '        background-position: 0 0;' +
            '    }' +
            '}' +
            '</style>';
        JiraScript.$body.append(css);
    }

    setHtml() {
        let html = '' +
            '<div class="jira-script p-1">' +
            '    <div class="row">' +
            '        <div class="col-12">' +
            '            <div class="card">' +
            '                <div class="card-header">' +
            '                    <div class="mt-1">' +
            '                        <form id="jira-script--form">' +
            '                            <div class="row mt-1">' +
            '                                <div class="form-group col-6">' +
            '                                    <select id="jira-script--select-project" class="custom-select c-pointer">' +
            '                                        <option value="WEBRU">WEBRU</option>' +
            '                                    </select>' +
            '                                </div>' +
            '                                <div class="form-group col-6">' +
            '                                    <select id="jira-script--select-actions" class="custom-select c-pointer">' +
            '                                        <option value="get-users">Get Users</option>' +
            '                                        <option value="add-users">Add Users</option>' +
            '                                        <option value="edit-issues">Update Fields</option>' +
            '                                        <option value="do-transition">Change transition</option>' +
            '                                    </select>' +
            '                                </div>' +
            '                            </div>' +
            '                            <div class="jira-script--items-dynamic"></div>' +
            '                        </form>' +
            '                    </div>' +
            '                </div>' +
            '                <div class="card-body">' +
            '                    <div class="jira-script--progress progress mt-1 d-none">' +
            '                        <div class="progress-bar progress-bar-animated" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>' +
            '                    </div>' +
            '                    <div class="jira-script--wrapper-table table-striped mt-1 d-none"></div>' +
            '                </div>' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        JiraScript.$body.append(html);

        let $elementObj = {
            $form: $('#jira-script--form'),
            $tableWrapper: $('.jira-script--wrapper-table')
        };
        JiraScript.$selectProjects = $('#jira-script--select-project');
        JiraScript.$progress = $('.jira-script--progress');
        JiraScript.$tableWrapper = $elementObj.$tableWrapper;

        return $elementObj;
    }

    static getRoleId(string) {
        return string.match(JiraScript.getRoleIdReg)[1];
    }

    static getDataIssues(fields, value) {
        const [field, type] = fields.split(':');
        switch (type) {
            case 'user': {
                return {
                    [field]: {
                        "name": value
                    }
                }
            }
            case 'date': {
                try {
                    const [, day, month, year] = value.match(JiraScript.dateReg);
                    return {
                        [field]: `${new Date(`${year}-${month}-${day}`).toISOString().slice(0, -1)}+0000`
                    }
                } catch (error) {
                    console.warn('Jira Script ', error);
                    return {
                        [field]: value
                    };
                }
            }
            case 'time': {
                return {
                    [field]: {
                        "originalEstimate": value
                    }
                }
            }
            case 'string': {
                return {
                    [field]: value
                }
            }
            default: {
                return false;
            }
        }
    }

    getRoles() {
        return $.ajax({
            type: 'GET',
            url: `/rest/api/2/project/${JiraScript.$selectProjects.val()}/role/`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            }
        }).then(roles => {
            let rolesObj = {};
            $.each(roles, (key, value) => {
                rolesObj = {
                    ...rolesObj,
                    [JiraScript.getRoleId(value)]: key
                }
            });
            return rolesObj;
        });
    }

    getUsers(role) {
        return $.ajax({
            type: 'GET',
            url: `/rest/api/2/project/${JiraScript.$selectProjects.val()}/role/${role}/`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            }
        }).then(({actors}) => actors);
    }

    addUsers(role, data) {
        const ajaxData = {
            "user": [...data]
        };
        return $.ajax({
            data: JSON.stringify(ajaxData),
            type: 'POST',
            url: `/rest/api/2/project/${JiraScript.$selectProjects.val()}/role/${role}/`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            }
        })
    }

    editIssues(fieldsArr, dataArr) {
        let ajaxDataObj = {};
        $.each(fieldsArr, (key, value) => {
            if (key === 0) return;
            ajaxDataObj.fields = {
                ...ajaxDataObj.fields,
                ...JiraScript.getDataIssues(value, dataArr[key])
            };
        });
        return $.ajax({
            data: JSON.stringify(ajaxDataObj),
            type: 'PUT',
            url: `/rest/api/2/issue/${dataArr[0]}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            }
        })
    }

    doTransition(transition, fieldsArr, dataArr) {
        let ajaxDataObj = {};
        $.each(fieldsArr, (key, value) => {
            if (key === 0) return;
            ajaxDataObj.fields = {
                ...ajaxDataObj.fields,
                ...JiraScript.getDataIssues(value, dataArr[key])
            };
        });
        ajaxDataObj.transition = {
            "id": transition
        };
        return $.ajax({
            data: JSON.stringify(ajaxDataObj),
            type: 'POST',
            url: `/rest/api/2/issue/${dataArr[0]}/transitions`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            }
        })
    }


    showProgress() {
        const $disabled = $('.jira-script').find('input, textarea, select, button');
        $disabled.prop('disabled', true);
        JiraScript.$progress.removeClass('d-none');
        JiraScript.$tableWrapper.addClass('d-none');
    }

    hideProgress() {
        const $disabled = $('.jira-script').find('input, textarea, select, button');
        $disabled.prop('disabled', false);
        JiraScript.$progress.addClass('d-none');
        JiraScript.$tableWrapper.removeClass('d-none');
    }


}

loadScript('https://code.jquery.com/jquery-3.3.1.min.js').then(() => {
    const jira = new JiraScript(),
        htmlObj = jira.setHtml(),
        $selectAction = htmlObj.$form.find('#jira-script--select-actions'),
        $itemsDynamic = htmlObj.$form.find('.jira-script--items-dynamic'),
        $tableWrapper = htmlObj.$tableWrapper;
    let $selectRole, $textareaData, $inputFields, $inputTransition;

    jira.setCss();

    const buildSelect = array => {
        let html = '';
        $.each(array, (key, value) => {
            html += `<option value="${key}">${value}</option>`
        });
        return html;
    };

    const html = (section, data = null) => {
        switch (section) {
            case 'get-users-header': {
                return '' +
                    '<div class="form-group">' +
                    `    <select id="jira-script--select-role" class="custom-select c-pointer">${buildSelect(data)}</select>` +
                    '</div>' +
                    '<button class="jira-script--button-get-users btn btn-primary" type="button">Get User</button>';
            }
            case 'get-users-body': {
                let html = '' +
                    '<table class="table-striped">' +
                    '    <thead>' +
                    '    <tr>' +
                    '        <th>#</th>' +
                    '        <th>Name</th>' +
                    '        <th>Login</th>' +
                    '    </tr>' +
                    '    </thead>' +
                    '    <tbody>';
                $.each(data, (key, value) => {
                    html += '' +
                        '<tr>' +
                        `    <td class="t-center">${++key}</td>` +
                        `    <td class="t-center">${value.displayName}</td>` +
                        `    <td class="t-center">${value.name}</td>` +
                        '</tr>';
                });
                html += '' +
                    '    </tbody>' +
                    '</table>';
                return html;
            }
            case 'add-users-header': {
                return '' +
                    '<div class="form-group">' +
                    `     <select id="jira-script--select-role" class="custom-select c-pointer">${buildSelect(data)}</select>` +
                    '</div>' +
                    '<div class="form-group">' +
                    '    <label for="jira-script--textarea">Login</label>' +
                    '    <textarea class="form-control" id="jira-script--textarea" placeholder="SOEID" rows="10" required></textarea>' +
                    '</div>' +
                    '<button class="jira-script--button-add-users btn btn-primary" type="button">Add User</button>';
            }
            case 'add-users-body': {
                if (!data) return '<p class="c-success">Успешно</p>';

                let html = '' +
                    '<table class="table-striped">' +
                    '    <thead>' +
                    '    <tr>' +
                    '        <th>#</th>' +
                    '        <th>Status</th>' +
                    '    </tr>' +
                    '    </thead>' +
                    '    <tbody>';
                $.each(data, (key, value) => {
                    html += '' +
                        '<tr>' +
                        `    <td class="t-center">${++key}</td>` +
                        `    <td class="t-center"><p class="c-danger">${value}</p></td>` +
                        '</tr>';
                });
                html += '' +
                    '    </tbody>' +
                    '</table>';
                return html;
            }
            case 'edit-issues-header': {
                return '' +
                    '<div class="form-group">' +
                    '    <label for="jira-script--input-columns">Name of Fields</label>' +
                    // '    <input type="text" class="form-control" id="jira-script--input-columns" placeholder="Name of Fields" value="id|customfield_55772:user|customfield_55773:user|customfield_42570:dateTime" required>' +
                    '    <input type="text" class="form-control" id="jira-script--input-columns" placeholder="Name of Fields" value="id|customfield_10042:user|timetracking:time|duedate:date" required>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '    <label for="jira-script--textarea">Update data</label>' +
                    // '    <textarea class="form-control" id="jira-script--textarea" placeholder="Update data" rows="10" required>WEBRU-88\tnb85492\tal71674\t05/05/2019</textarea>' +
                    '    <textarea class="form-control" id="jira-script--textarea" placeholder="Update data" rows="10" required>WEBRU-88\t2018-09-13-2\t3d\t05/05/2019</textarea>' +
                    '</div>' +
                    '<button class="jira-script--button-edit-issues btn btn-primary" type="button">Update Fields</button>';
            }
            case 'edit-issues-body': {
                let html = '' +
                    '<table class="table-striped">' +
                    '    <thead>' +
                    '    <tr>' +
                    '        <th>#</th>' +
                    '        <th>Issue</th>' +
                    '        <th>Status</th>' +
                    '    </tr>' +
                    '    </thead>' +
                    '    <tbody>';
                $.each(data, (key, value) => {
                    html += '' +
                        '<tr>' +
                        `    <td class="t-center">${++key}</td>` +
                        `    <td class="t-center">${value.id}</td>` +
                        '    <td class="t-center">';
                    if (!value.errors) {
                        html += '<p class="c-success">Успешно</p>';
                    } else {
                        $.each(value.errors, (field, error) => {
                            html += `<p class="c-danger">${field} - ${error}</p>`;
                        });
                    }
                    html += '' +
                        '    </td>' +
                        '</tr>';
                });
                html += '' +
                    '    </tr>' +
                    '    </tbody>' +
                    '</table>';
                return html;
            }
            case 'do-transition-header': {
                return '' +
                    '<div class="form-group">' +
                    '    <label for="jira-script--input-transition">ID of Transitions</label>' +
                    '    <input type="number" class="form-control" id="jira-script--input-transition" placeholder="ID of Transitions" value="" required>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '    <label for="jira-script--input-columns">Name of Fields</label>' +
                    '    <input type="text" class="form-control" id="jira-script--input-columns" placeholder="Name of Fields" value="id" required>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '    <label for="jira-script--textarea">Update data</label>' +
                    '    <textarea class="form-control" id="jira-script--textarea" placeholder="Update data" rows="10" required>WEBRU-88</textarea>' +
                    '</div>' +
                    '<button class="jira-script--button-do-transition btn btn-primary" type="button">Do Transition</button>';
            }
            case 'do-transition-body': {
                let html = '' +
                    '<table class="table-striped">' +
                    '    <thead>' +
                    '    <tr>' +
                    '        <th>#</th>' +
                    '        <th>Issue</th>' +
                    '        <th>Status</th>' +
                    '    </tr>' +
                    '    </thead>' +
                    '    <tbody>';
                $.each(data, (key, value) => {
                    html += '' +
                        '<tr>' +
                        `    <td class="t-center">${++key}</td>` +
                        `    <td class="t-center">${value.id}</td>` +
                        '    <td class="t-center">';
                    if (!value.errors) {
                        html += '<p class="c-success">Успешно</p>';
                    } else {
                        let {errors, errorMessages} = value.errors;
                        console.log(errors, errorMessages);
                        html += (errorMessages.length !== 0) ? `<p class="c-danger">${errorMessages}</p>` : '';
                        $.each(errors, (field, error) => {
                            html += `<p class="c-danger">${field} - ${error}</p>`;
                        });
                    }
                    html += '' +
                        '    </td>' +
                        '</tr>';
                });
                html += '' +
                    '    </tr>' +
                    '    </tbody>' +
                    '</table>';
                return html;
            }
        }
    };

    const selectAction = (event) => {
        const value = $(event.currentTarget).val();
        switch (value) {
            case 'get-users': {
                jira.showProgress();
                $tableWrapper.empty();
                jira.getRoles().then(rolesObj => {
                    $itemsDynamic.html(html('get-users-header', rolesObj));
                    $selectRole = $('#jira-script--select-role');
                    $('.jira-script--button-get-users').on('click', getUsers);
                    jira.hideProgress();
                }).fail(({status}) => {
                    jira.hideProgress();
                    console.error(status)
                });
                return false;
            }
            case 'add-users': {
                jira.showProgress();
                $tableWrapper.empty();
                jira.getRoles().then(rolesObj => {
                    $itemsDynamic.html(html('add-users-header', rolesObj));
                    $selectRole = $('#jira-script--select-role');
                    $textareaData = $('#jira-script--textarea');
                    $('.jira-script--button-add-users').on('click', addUsers);
                    jira.hideProgress();
                }).fail(({status}) => {
                    jira.hideProgress();
                    console.error(status)
                });
                return false;
            }
            case 'edit-issues': {
                $tableWrapper.empty();
                $itemsDynamic.html(html('edit-issues-header'));
                $inputFields = $('#jira-script--input-columns');
                $textareaData = $('#jira-script--textarea');
                $('.jira-script--button-edit-issues').on('click', editIssues);
                return false;
            }
            case 'do-transition': {
                $tableWrapper.empty();
                $itemsDynamic.html(html('do-transition-header'));
                $inputTransition = $('#jira-script--input-transition');
                $inputFields = $('#jira-script--input-columns');
                $textareaData = $('#jira-script--textarea');
                $('.jira-script--button-do-transition').on('click', doTransition);
                return false;
            }
        }
    };

    const getUsers = () => {
        jira.showProgress();
        jira.getUsers($selectRole.val()).then(usersArr => {
            $tableWrapper.html(html('get-users-body', usersArr));
            jira.hideProgress();
        }).fail(({status}) => {
            jira.hideProgress();
            console.error(status)
        });
    };

    const addUsers = () => {
        jira.showProgress();
        const textareaValArr = $textareaData.val().split('\n');
        jira.addUsers($selectRole.val(), textareaValArr).then(() => {
            $tableWrapper.html(html('add-users-body'));
            jira.hideProgress();
        }).fail(({responseJSON}) => {
            $tableWrapper.html(html('add-users-body', responseJSON.errorMessages));
            jira.hideProgress();
        });
    };

    const editIssues = () => {
        jira.showProgress();
        const inputFieldsValArr = $inputFields.val().split('|'),
            textareaValArr = $textareaData.val().split('\n');

        let issuesArr = [];
        const promiseArr = $.map(textareaValArr, (value) => {
            let dataFieldArr = value.split('\t');
            return jira.editIssues(inputFieldsValArr, dataFieldArr).then(() => {
                issuesArr.push({
                    id: dataFieldArr[0],
                    errors: false,
                });
            }, ({responseJSON}) => {
                issuesArr.push({
                    id: dataFieldArr[0],
                    errors: responseJSON.errors,
                });
            });
        });
        $.when.apply(this, promiseArr).then(() => {
            $tableWrapper.html(html('edit-issues-body', issuesArr));
            jira.hideProgress();
        });
    };

    const doTransition = () => {
        jira.showProgress();
        const inputTransition = $inputTransition.val(),
            inputFieldsValArr = $inputFields.val().split('|'),
            textareaValArr = $textareaData.val().split('\n');

        let issuesArr = [];
        const promiseArr = $.map(textareaValArr, (value) => {
            let dataFieldArr = value.split('\t');
            return jira.doTransition(inputTransition, inputFieldsValArr, dataFieldArr).then(() => {
                issuesArr.push({
                    id: dataFieldArr[0],
                    errors: false,
                });
            }, ({responseJSON}) => {
                issuesArr.push({
                    id: dataFieldArr[0],
                    errors: responseJSON,
                });
            });
        });
        $.when.apply(this, promiseArr).then(() => {
            $tableWrapper.html(html('do-transition-body', issuesArr));
            jira.hideProgress();
        });
    };

    $selectAction.on('change', selectAction);

    $selectAction.trigger('change');
});