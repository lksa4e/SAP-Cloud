sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FilterOperator"
], function (Controller, Filter, JSONModel, FilterOperator) {
	"use strict";
	return Controller.extend("ProjB.zcbProj006_3.controller.Main", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ProB.zcbProj004.view.Next
		 */

		onInit: function () {
			var that = this;
			// JSON Model 선언			

			var username;
			var CAR_NUM;
			var oModel = new sap.ui.model.json.JSONModel();
			// Model 명 지정		
			this.getView().setModel(oModel, "userapi");
			// UserInfo Api Load
			oModel.loadData("/services/userapi/currentUser");
		

			/* Add a completion handler to log the json and any errors*/

			oModel.attachRequestCompleted(function onCompleted(oEvent) {
				if (oEvent.getParameter("success")) { //성공
					this.setData({
						"json": this.getJSON(),
						"status": "Success"
					}, true);

					var model1 = that.getView().getModel("userapi");
					username = model1.oData.name;

					that.getOwnerComponent().getModel().read("/ZR_USERCUSTOMER", {
						filters: [new Filter({
							path: "USER",
							operator: FilterOperator.EQ,
							value1: username
						})],
						success: function (odata1, Response1) {

							that.getView().byId("CAR_NUM").setValue(odata1["results"][0]["CAR_NUM"]);
							///////////

							CAR_NUM = odata1["results"][0]["CAR_NUM"];
							that.getOwnerComponent().getModel().read("/ZR_TRANS_MASTER",{
								filters: [new Filter({
									path: "CAR_NUM",
									operator: FilterOperator.EQ,
									value1: CAR_NUM
								})],
								success: function (odata11, Response11) {
									if (odata11.results.length === 0) { //호출했는데 가져올게 없어서 oData2가 빈껍데기 

									} else {  //빈껍데기가 아닌거
										that.getView().byId("CAR_NAME").setValue(odata11.results[0].CAR_NAME);
										that.getView().byId("CAR_TRANSP").setValue(odata11.results[0].CAR_TRANSP);
										that.getView().byId("CAR_TEL").setValue(odata11.results[0].CAR_TEL);
										that.getView().byId("CAR_DRIVER").setValue(odata11.results[0].CAR_DRIVER);
										that.getView().byId("CAR_DRIVER_TEL").setValue(odata11.results[0].CAR_DRIVER_TEL);
										that.getView().byId("CAR_PRICE").setValue(odata11.results[0].CAR_PRICE);
										that.getView().byId("CAR_CUR").setValue(odata11.results[0].CAR_CUR);
									}
								},
								error: function (cc, vv) {}
							});

							////////////////////////////
							that.getOwnerComponent().getModel().read("/ZR_TRANS", {  //허브테이블
								filters: [new Filter({
									path: "CAR_NUM",
									operator: FilterOperator.EQ,
									value1: CAR_NUM

								}), new Filter({
									path: "STATUS",
									operator: FilterOperator.EQ,
									value1: "R"
								})],
								success: function (odata2, Response2) {
									if (odata2.results.length === 0) { //호출했는데 가져올게 없어서 oData2가 빈껍데기 

									} else {  //빈껍데기가 아닌거
										that.getView().byId("CARCOM_O").setValue(odata2.results[0].COMMENT_O);
										that.getView().byId("text0").setText(odata2.results[0].DOC_NUM);
									}
								}, 
								error: function (cc, vv) {}
							});
							
						},
						error: function (cv1, vv2) {}
					});
				} else {
					var msg = oEvent.getParameter("errorObject").textStatus;
					if (msg) {
						this.setData("status", msg);
					} else {
						this.setData("status", "Unknown error retrieving user info");
					}
				}

			});

		},
		action: function (oEvent) {
			var that = this;
			var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
			var eventType = oEvent.getId();
			var aTargets = actionParameters[eventType].targets || [];
			aTargets.forEach(function (oTarget) {
				var oControl = that.byId(oTarget.id);
				if (oControl) {
					var oParams = {};
					for (var prop in oTarget.parameters) {
						oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
					}
					oControl[oTarget.action](oParams);
				}
			});
			var oNavigation = actionParameters[eventType].navigation;
			if (oNavigation) {
				var oParams = {};
				(oNavigation.keys || []).forEach(function (prop) {
					oParams[prop.name] = encodeURIComponent(JSON.stringify({
						value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
						type: prop.type
					}));
				});
				if (Object.getOwnPropertyNames(oParams).length !== 0) {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
				} else {
					this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
				}
			}
		}

	});

});