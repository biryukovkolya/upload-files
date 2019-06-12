class JiraScript {
    constructor() {
        JiraScript.dateReg = /([0-9]{1,2})[.\-\/]([0-9]{1,2})[.\-\/]([0-9]{2,4})/i;
        this.project = '13301';
        this.issueType = '10000';
        this.applicationId = '97829214-4168-3d08-a277-a14fee89bce6';
    }


    getData(type, data) {
        switch (type) {
            case 'description': {
                const {label, value} = data;
                return `*${label}*\r\n${value}\r\n\r\n`;
            }
            case 'date': {
                try {
                    const [, day, month, year] = data.match(JiraScript.dateReg);
                    return `${new Date(`${year}-${month}-${day}`).toISOString().slice(0, -1)}+0000`;
                } catch (error) {
                    console.warn('Jira Script ', error);
                    return;
                }
            }
        }
    }

    createIssue(data) {
        const ajaxData = {
            "issues": [{
                "fields": {
                    "project": {
                        "id": this.project
                    },
                    "issuetype": {
                        "id": this.issueType
                    },
                    ...data,
                }
            }]
        };
        return $.ajax({
            data: JSON.stringify(ajaxData),
            type: 'POST',
            url: `/confluence/rest/jira-integration/1.0/issues?applicationId=${this.applicationId}`,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            }
        });
    }

    validation($fields) {
        let isValid = true;
        $fields.each((key, element) => {
            let $element = $(element),
                data = $element.data(),
                $messages = $element.closest('.form-group').children('.form-message');

            let validation = $.map(data, (value, key) => {
                if (key.startsWith('validation')) return {
                    "key": key.slice(10).toLowerCase(),
                    "value": value
                }
            });

            if (validation.length === 0) return;
            $.each(validation, (index, value) => {
                switch (value.key) {
                    case 'empty': {
                        console.log('dsa13');
                        if (!$.trim($element.val())) {
                            console.log('dsa14');
                            $element.removeClass('is-valid')
                                .addClass('is-invalid');
                            $messages.text(value.value);
                            isValid = false;
                            return false;
                        } else {
                            $element.removeClass('is-invalid')
                                .addClass('is-valid');
                            $messages.html('&nbsp;')
                        }
                        return;
                    }
                    case 'date': {
                        console.log('dsa1');
                        if ($.trim($element.val()) && !JiraScript.dateReg.test($element.val())) {
                            console.log('dsa12');
                            $element.removeClass('is-valid')
                                .addClass('is-invalid');
                            $messages.text(value.value);
                            isValid = false
                            return false;
                        } else {
                            $element.removeClass('is-invalid')
                                .addClass('is-valid');
                            $messages.html('&nbsp;')
                        }
                        return;
                    }
                    default: {
                        return;
                    }
                }
            })
        });
        return isValid;
    }
}

(function () {
    const $htmlBody = $('html, body'),
        $createIssuesForm = $('.create-issues--form'),
        $createIssuesProgress = $('.create-issues--progress'),
        $createIssuesMessage = $('.create-issues--message'),
        $createIssuesFields = $createIssuesForm.find('.form-control'),
        jira = new JiraScript();

    const buildHtml = (type, data = null) => {
        switch (type) {
            case 'errors': {
                let html = '<div class="aui-message aui-message-error closeable shadowed show">' +
                    '<p class="title"><strong>Error!</strong></p>';
                $.each(data, (field, value) => {
                    html += `<strong>${field}</strong>: ${value}<br />`;
                });
                html += 'Please contact to <a href="mailto:nikolay.biryukov@citi.com">Nikolay Biryukov</a>';
                return html;
            }
            case 'success': {
                const {key, summary} = data;
                const html = '<div class="aui-message aui-message-success closeable shadowed show">' +
                    '<p class="title"><strong>Success!</strong></p>' +
                    `Issue <a target="_blank" href="https://cedt-gct-jira.nam.nsroot.net/jira/browse/${key}">${key} - ${summary}</a> has been successfully created.` +
                    `<br />Please push materials to network drive: <strong>\\\\vkovnascti0027\\Web_and_e_mail_materials\\JIRA\\${key}</strong>`;
                return html;
            }
        }
    };

    const showProgress = () => {
        $createIssuesFields.prop('disabled', true);
        $createIssuesMessage.addClass('hidden');
        $createIssuesProgress.removeClass('hidden');
        $htmlBody.animate({
            scrollTop: (0)
        }, 500);
    };

    const hideProgress = () => {
        $createIssuesFields.prop('disabled', false);
        $createIssuesProgress.addClass('hidden');
        $createIssuesMessage.removeClass('hidden');
    };

    $createIssuesForm.on('submit', () => {
        console.log('das');

        if (!jira.validation($createIssuesFields)) return false;

        let ajaxData = {};

        $createIssuesFields.each((index, element) => {
            let $element = $(element),
                name = $element.attr('name');
            if (!$.trim($element.val())) {
                return;
            }
            console.log($element);
            name = (name.startsWith('description')) ? name.slice(0, 11) : name;
            switch (name) {
                case 'summary': {
                    ajaxData = {
                        ...ajaxData,
                        [name]: $element.val(),
                        'customfield_10005': $element.val()

                    };
                    return;
                }
                case 'components': {
                    ajaxData[name] = [{
                        "id": $element.val()
                    }];
                    return;
                }
                case 'labels': {
                    ajaxData[name] = [$element.val()];
                    return;
                }
                case 'description': {
                    let $label = $element.parent().prev().find('span:eq(0)');
                    if (!ajaxData.hasOwnProperty(name)) {
                        ajaxData[name] = '';
                    }
                    ajaxData[name] += jira.getData('description', {label: $label.text(), value: $element.val()});
                    return;
                }
                case 'customfield_11001': {
                    ajaxData[name] = jira.getData('date', $element.val());
                    return;
                }
                default: {
                    ajaxData[name] = $element.val();
                    return;
                }
            }

        });

        showProgress();
        jira.createIssue(ajaxData).then((data) => {
            let html = '';
            if (data.hasOwnProperty('errors')) {
                const {errors} = data.errors[0].elementErrors;
                $createIssuesMessage.html(buildHtml('errors', errors));
                hideProgress();
                console.log(html, data);
                return;
            }
            const {key} = data.issues[0].issue;
            $createIssuesMessage.html(buildHtml('success', {"key": key, "summary": ajaxData.summary}));
            hideProgress();
            console.log(html, data);
        }).fail((data) => console.log(data));
        return false;
    });
})();