import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import TranslateIcon from '@material-ui/icons/Translate';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Button, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { LANGUAGES_LABEL } from 'renderer/assets/locales/resource';

const useStyles = makeStyles((theme) => ({
  language: {
    margin: theme.spacing(0, 0.5, 0, 1),
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  },
}));

export default function LanguageSwitcher() {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLanguageIconClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setAnchorEl(null);
  };

  const switchLanguage = (language: string) => {
    i18n.changeLanguage(language);
    handleLanguageMenuClose();
  };

  return (
    <div>
      <Tooltip title={t('Change Language')} enterDelay={300}>
        <Button
          aria-owns="language-menu"
          aria-haspopup="true"
          aria-label={t('Change Language')}
          onClick={handleLanguageIconClick}
          data-ga-event-category="header"
          data-ga-event-action="language"
        >
          <TranslateIcon />
          <span className={classes.language}>
            {i18n.language === 'aa'
              ? 'Translating'
              : LANGUAGES_LABEL.filter(
                  (language) => language.code === i18n.language
                )[0].text}
          </span>
          <ExpandMoreIcon fontSize="small" />
        </Button>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleLanguageMenuClose}
      >
        {LANGUAGES_LABEL.map((language) => (
          <MenuItem
            component="a"
            data-no-link="true"
            key={language.code}
            selected={i18n.language === language.code}
            onClick={() => {
              switchLanguage(language.code);
            }}
            lang={language.code}
            hrefLang={language.code}
          >
            {language.text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
