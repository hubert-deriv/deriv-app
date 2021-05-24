import { localize } from '@deriv/translations';
import { generateValidationFunction, getDefaultFields, getErrorMessages } from '@deriv/shared';

const address_details_config = ({ account_settings, is_svg }) => {
    if (!account_settings) {
        return {};
    }

    return {
        address_line_1: {
            supported_in: ['svg', 'iom', 'malta', 'maltainvest'],
            default_value: account_settings.address_line_1 ?? '',
            rules: [
                ['req', localize('First line of address is required')],
                [
                    'address',
                    localize('Letters, numbers, spaces, periods, hyphens, apostrophes, commas only'),
                    {
                        regex: /^[\p{L}\p{Nd}\s'.,:;()\x{b0}@#/-]{1,70}$/,
                    },
                ],
                ['length', localize('This should not exceed {{max}} characters.', { max: 70 }), { max: 70 }],
                ['po_box', getErrorMessages().po_box()],
            ].filter(x => (is_svg ? x.indexOf('po_box') !== 0 : x)),
        },
        address_line_2: {
            supported_in: ['svg', 'iom', 'malta', 'maltainvest'],
            default_value: account_settings.address_line_2 ?? '',
            rules: [
                [
                    'address',
                    localize('Letters, numbers, spaces, periods, hyphens, apostrophes, commas only'),
                    {
                        regex: /^[\p{L}\p{Nd}\s'.,:;()\x{b0}@#/-]{0,70}$/,
                    },
                ],
                ['length', localize('This should not exceed {{max}} characters.', { max: 70 }), { max: 70 }],
                ['po_box', getErrorMessages().po_box()],
            ].filter(x => (is_svg ? x.indexOf('po_box') !== 0 : x)),
        },
        address_city: {
            supported_in: ['svg', 'iom', 'malta', 'maltainvest'],
            default_value: account_settings.address_city ?? '',
            rules: [
                ['req', localize('City is required')],
                [
                    'regular',
                    localize('Letters, numbers, spaces, periods, hyphens, apostrophes only'),
                    {
                        regex: /^[A-Za-z0-9\s'.-]{1,35}$/,
                    },
                ],
            ],
        },
        address_state: {
            supported_in: ['svg', 'iom', 'malta', 'maltainvest'],
            default_value: account_settings.address_state ?? '',
            rules: [
                ['req', localize('State is required')],
                [
                    'regular',
                    localize('State is not in a proper format'),
                    {
                        regex: /^[\w\s\W'.-;,]{0,60}$/,
                    },
                ],
            ],
        },
        address_postcode: {
            supported_in: ['svg', 'iom', 'malta', 'maltainvest'],
            default_value: account_settings.address_postcode ?? '',
            rules: [
                [
                    'length',
                    localize('Please enter a {{field_name}} under {{max_number}} characters.', {
                        field_name: localize('postal/ZIP code'),
                        max_number: 20,
                        interpolation: { escapeValue: false },
                    }),
                    { min: 0, max: 20 },
                ],
                ['postcode', getErrorMessages().postcode()],
            ],
        },
    };
};

const addressDetailsConfig = (
    { upgrade_info, real_account_signup_target, residence, account_settings },
    AddressDetails,
    is_dashboard = false
) => {
    const is_svg = upgrade_info?.can_upgrade_to === 'svg';
    const config = address_details_config({ account_settings, is_svg });
    return {
        header: {
            active_title: is_dashboard ? localize('Where do you live?') : localize('Complete your address details'),
            title: is_dashboard ? localize('ADDRESS') : localize('Address'),
        },
        body: AddressDetails,
        form_value: getDefaultFields(real_account_signup_target, config),
        props: {
            validate: generateValidationFunction(
                real_account_signup_target,
                transformConfig(transformForResidence(config, residence), real_account_signup_target)
            ),
            is_svg,
        },
        passthrough: ['residence_list', 'is_fully_authenticated'],
        icon: 'IcDashboardAddress',
    };
};

/**
 * Transform general rules based on residence
 *
 * @param {object} rules - Original rules
 * @param {string} residence - Client's residence
 * @return {object} rules - Transformed rules
 */
const transformForResidence = (rules, residence) => {
    // Isle of Man Clients do not need to fill out state since API states_list is empty.
    if (residence === 'im') {
        rules.address_state.rules.shift();
    }
    // GB residence are required to fill in the post code.
    if (/^(im|gb)$/.test(residence)) {
        rules.address_postcode.rules.splice(0, 0, ['req', localize('Postal/ZIP code is required')]);
    }

    return rules;
};

const transformConfig = (config, { real_account_signup_target }) => {
    // Remove required rule for svg clients
    if (!real_account_signup_target || real_account_signup_target === 'svg') {
        config.address_state.rules.shift();
    }

    return config;
};

export default addressDetailsConfig;
