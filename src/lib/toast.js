import { message } from 'antd';

export const toast = {
  success: (text, duration = 3) => {
    message.success({ content: text, duration });
  },
  error: (text, duration = 4) => {
    message.error({ content: text, duration });
  },
  warning: (text, duration = 3) => {
    message.warning({ content: text, duration });
  },
  info: (text, duration = 3) => {
    message.info({ content: text, duration });
  },
};
