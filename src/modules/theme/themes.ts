import './themes.scss';

export const Themes = {
    LIGHT: 'Light',
    DARK: 'Dark'
};

export function getThemeClassName(theme: string) {
    if(theme === Themes.DARK) {
        return 'dark-theme';
    }
    return 'light-theme';
}
