TemplateWizard
==============

A MediaWiki extension for adding a popup dialog box to the WikiEditor toolbar
with which to add template code to wikitext.

https://www.mediawiki.org/wiki/Extension:TemplateWizard

## Running browser tests

Start chromedriver:

    chromedriver --url-base=wd/hub --port=4444

Run Selenium from the MediaWiki root directory:

    export MW_SERVER=http://localhost
    export MW_SCRIPT_PATH=/path/to/wiki
    export MEDIAWIKI_USER=Admin
    export MEDIAWIKI_PASSWORD=adminpassword
    ./node_modules/.bin/wdio ./tests/selenium/wdio.conf.js --spec extensions/TemplateWizard/tests/selenium/specs/TemplateWizard.SearchForm.js
