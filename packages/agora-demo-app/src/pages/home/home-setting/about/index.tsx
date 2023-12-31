import { privacyPolicyURL, useAgreementURL } from '@app/utils/url';
import { transI18n } from 'agora-common-libs';
import { EduClassroomConfig } from 'agora-edu-core';
import logo from '../assets/logo.svg';
import './index.css';

declare const DEMO_VERSION: string;


export const About = () => {
  return (
    <div className="about-setting leading-8">
      <div className="title">{transI18n('fcr_settings_label_about_us_about_us')}</div>
      <p>
        {transI18n('fcr_settings_label_about_us_fcr_ver')}
        {`: ver ${DEMO_VERSION}`}
      </p>
      <p>
        {transI18n('fcr_settings_label_about_us_sdk_ver')}
        {`: ver ${EduClassroomConfig.getRtcVersion()}`}
      </p>
      <p>
        <a href={useAgreementURL()} target="_blank" rel="noreferrer">
          {transI18n('fcr_settings_link_about_us_user_agreement')}
        </a>
      </p>
      <p>
        <a href={privacyPolicyURL()} target="_blank" rel="noreferrer">
          {transI18n('fcr_settings_link_about_us_privacy_policy')}
        </a>
      </p>
      <div className="logo">
        <img src={logo} alt="" />
        {transI18n('home.header-left-title')}
      </div>
    </div>
  );
};
