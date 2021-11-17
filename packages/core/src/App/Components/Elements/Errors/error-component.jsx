import PropTypes from 'prop-types';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { PageError } from '@deriv/components';
import { routes } from '@deriv/shared';
import { localize } from '@deriv/translations';
import { connect } from 'Stores/connect';
import { CloseMxMltAccountContent } from 'App/Containers/CloseMxMltAccountModal/close-mx-mlt-account-modal.jsx';

const ErrorComponent = ({
    has_malta_account,
    header,
    message,
    redirect_label,
    redirectOnClick,
    should_clear_error_on_click,
    setError,
    showNotificationMessageByKey,
    showCloseMxMltAccountPopup,
    removeNotificationMessageByKey,
    type,
    is_iom,
    redirect_to = routes.trade,
    should_show_refresh = true,
}) => {
    const history = useHistory();

    React.useEffect(() => {
        if (!history) return undefined;
        return history.listen(() => {
            if (typeof setError === 'function') {
                setError(false, null);
            }
        });
    }, [history, setError]);

    const refresh_message = should_show_refresh ? localize('Please refresh this page to continue.') : '';

    if (type === 'mx_mlt_removal') {
        return (
            <div className='close-mx-mlt-account--is-fullscreen'>
                <div className='close-mx-mlt-account'>
                    <div className='close-mx-mlt-account__content'>
                        <CloseMxMltAccountContent
                            has_malta_account={has_malta_account}
                            is_iom={is_iom}
                            is_fullscreen={true}
                            showNotificationMessageByKey={showNotificationMessageByKey}
                            showCloseMxMltAccountPopup={showCloseMxMltAccountPopup}
                            removeNotificationMessageByKey={removeNotificationMessageByKey}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (localStorage.getItem('hide_close_mx_mlt_account_notification')) {
        return (
            <PageError
                header={header || localize('Something’s not right')}
                messages={message ? [message, refresh_message] : []}
                redirect_urls={[]}
                redirect_labels={[]}
                buttonOnClick={() => ({})}
                should_clear_error_on_click={false}
                setError={setError}
            />
        );
    }
    return (
        <PageError
            header={header || localize('Something’s not right')}
            messages={
                message
                    ? [message, refresh_message]
                    : [localize('Sorry, an error occured while processing your request.'), refresh_message]
            }
            redirect_urls={[redirect_to]}
            redirect_labels={[redirect_label || localize('Refresh')]}
            buttonOnClick={redirectOnClick || (() => location.reload())}
            should_clear_error_on_click={should_clear_error_on_click}
            setError={setError}
            has_malta_account={has_malta_account}
        />
    );
};

ErrorComponent.propTypes = {
    message: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
    type: PropTypes.string,
};

export default connect(({ client, ui }) => ({
    removeNotificationMessageByKey: ui.removeNotificationMessageByKey,
    showCloseMxMltAccountPopup: ui.showCloseMxMltAccountPopup,
    is_iom: client.residence === 'im',
    has_malta_account: client.has_malta_account,
}))(ErrorComponent);
