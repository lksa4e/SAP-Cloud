/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ProB/zcbProj006_3/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});