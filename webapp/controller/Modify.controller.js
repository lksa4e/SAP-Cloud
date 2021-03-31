sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/core/format/DateFormat"
], function (Controller, Filter, JSONModel, FilterOperator, MessageBox, DateFormat) {
	"use strict";
	return Controller.extend("ProjB.zcbProj006_3.controller.Modify", {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf ProjB.zcbProj004.view.Modify
		 */
		onInit: function () {
			var that = this;
			// JSON Model 선언			
			var oModel = new sap.ui.model.json.JSONModel();
			var username;
			var CAR_NUM;
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
							that.getOwnerComponent().getModel().read("/ZR_TRANS_MASTER", {
								filters: [new Filter({
									path: "CAR_NUM",
									operator: FilterOperator.EQ,
									value1: CAR_NUM
								})],
								success: function (odata11, Response11) {
									if (odata11.results.length === 0) { //호출했는데 가져올게 없어서 oData2가 빈껍데기 

									} else { //빈껍데기가 아닌거
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
							that.getOwnerComponent().getModel().read("/ZR_TRANS", {
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
									if (odata2.results.length === 0) { // R 없다
									} else { //R 있다
										that.getView().byId("CARCOM_O").setValue(odata2.results[0].COMMENT_O);
										that.getView().byId("DOC").setText(odata2.results[0].DOC_NUM);
									}

								},
								error: function (cc, vv) {

								}
							});
						},
						error: function (cv1, vv1) {}
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

		create: function (oEvent) {
			var that = this;
			var CAR_NUM = that.getView().byId("CAR_NUM").getValue();  
			this.getOwnerComponent().getModel().read("/ZR_TRANS", {    //FUNC1 . 전체 table entry 개수 구하기 why? -> 문서 create할때 entry + 1 로 문서번호 지정 
				success: function (odata33, Response33) {
					var DOC_NUM = odata33["results"]["length"] + 1 + "";
					/////////////////////////////////////////////////////////
					that.getOwnerComponent().getModel().read("/ZR_TRANS", { //FUNC2 . 필터 걸어서 CAR_NUM하고 상태 R인거 찾는다 
						filters: [new Filter({
							path: "CAR_NUM",
							operator: FilterOperator.EQ,
							value1: CAR_NUM

						}), new Filter({
							path: "STATUS",
							operator: FilterOperator.EQ,
							value1: "R"
						})],
						success: function (odata3, Response3) {

							var CAR_NAME = that.getView().byId("CAR_NAME").getValue();
							var CAR_TRANSP = that.getView().byId("CAR_TRANSP").getValue();
							var CAR_TEL = that.getView().byId("CAR_TEL").getValue();
							var CAR_DRIVER = that.getView().byId("CAR_DRIVER").getValue();
							var CAR_DRIVER_TEL = that.getView().byId("CAR_DRIVER_TEL").getValue();
							var CAR_PRICE = that.getView().byId("CAR_PRICE").getValue();
							var CAR_CUR = that.getView().byId("CAR_CUR").getValue();
							var CARCOM_C = that.getView().byId("CARCOM_C").getValue();
							var CARCOM_O = "",
								STATUS = "",
								DATE_Q = "",
								DATE_A = "",
								CAR_NAME_X = "",
								CAR_TRANSP_X = "",
								CAR_TEL_X = "",
								CAR_DRIVER_X = "",
								CAR_DRIVER_TEL_X = "",
								CAR_PRICE_X = "",
								CAR_CUR_X = "";

							var Load;
							var Load2;

							if (odata3.results.length !== 0) { // 상태가 R인게 있다.  -> update
								//update
								Load2 = {
									"CAR_NUM": CAR_NUM,
									"CAR_NAME": CAR_NAME,
									"CAR_TRANSP": CAR_TRANSP,
									"CAR_TEL": CAR_TEL,
									"CAR_DRIVER": CAR_DRIVER,
									"CAR_DRIVER_TEL": CAR_DRIVER_TEL,
									"CAR_PRICE": CAR_PRICE,
									"CAR_CUR": CAR_CUR,
									"CARCOM_O": CARCOM_O,
									"CARCOM_C": CARCOM_C,
									"STATUS": "P",
									"DATE_Q": DATE_Q,
									"DATE_A": DATE_A,
									"CAR_NAME_X": CAR_NAME_X,
									"CAR_TRANSP_X": CAR_TRANSP_X,
									"CAR_TEL_X": CAR_TEL_X,
									"CAR_DRIVER_X": CAR_DRIVER_X,
									"CAR_DRIVER_TEL_X": CAR_DRIVER_TEL_X,
									"CAR_PRICE_X": CAR_PRICE_X,
									"CAR_CUR_X": CAR_CUR_X
								};
								var tempDOC = odata3.results[0].DOC_NUM;
								////////////////////////////////////////////////////////////
								that.getOwnerComponent().getModel().update("/ZR_TRANS('" + tempDOC + "')", Load2, { //update
									method: "PUT",
									success: function (odata4, Response4) {
										sap.m.MessageBox.alert("재요청 되었습니다", {
											title: "Alert",
											// default
											onClose: null,
											// default
											styleClass: "",
											// default
											initialFocus: null,
											// default
											textDirection: sap.ui.core.TextDirection.Inherit
										});
									},
									error: function (cc2, vv2) {}
								});

							} else {  // 상태가 R인게 없다 == 그냥 P or A -> create
								//create
								that.getOwnerComponent().getModel().read("/ZR_TRANS_MASTER('" + CAR_NUM + "')", {  //마스터의 data와 view input값과 비교해서 X 표시
									success: function (odata5, response5) {

										if (odata5["CAR_NAME"] !== CAR_NAME) {
											CAR_NAME_X = "X";
										}
										if (odata5["CAR_TRANSP"] !== CAR_TRANSP) {
											CAR_TRANSP_X = "X";
										}
										if (odata5["CAR_TEL"] !== CAR_TEL) {
											CAR_TEL_X = "X";
										}
										if (odata5["CAR_DRIVER"] !== CAR_DRIVER) {
											CAR_DRIVER_X = "X";
										}
										if (odata5["CAR_DRIVER_TEL"] !== CAR_DRIVER_TEL) {
											CAR_DRIVER_TEL_X = "X";
										}
										if (odata5["CAR_PRICE"] !== CAR_PRICE) {
											CAR_PRICE_X = "X";
										}
										if (odata5["CAR_CUR"] !== CAR_CUR) {
											CAR_CUR_X = "X";
										}

										Load = {
											"DOC_NUM": DOC_NUM,
											"CAR_NUM": CAR_NUM,
											"CAR_NAME": CAR_NAME,
											"CAR_TRANSP": CAR_TRANSP,
											"CAR_TEL": CAR_TEL,
											"CAR_DRIVER": CAR_DRIVER,
											"CAR_DRIVER_TEL": CAR_DRIVER_TEL,
											"CAR_PRICE": CAR_PRICE,
											"CAR_CUR": CAR_CUR,
											"CARCOM_O": CARCOM_O,
											"CARCOM_C": CARCOM_C,
											"STATUS": STATUS,
											"DATE_Q": DATE_Q,
											"DATE_A": DATE_A,
											"CAR_NAME_X": CAR_NAME_X,
											"CAR_TRANSP_X": CAR_TRANSP_X,
											"CAR_TEL_X": CAR_TEL_X,
											"CAR_DRIVER_X": CAR_DRIVER_X,
											"CAR_DRIVER_TEL_X": CAR_DRIVER_TEL_X,
											"CAR_PRICE_X": CAR_PRICE_X,
											"CAR_CUR_X": CAR_CUR_X
										};
										that.getOwnerComponent().getModel().create("/ZR_TRANS", Load, { //create
											success: function (odata7, Response7) {
												sap.m.MessageBox.alert("요청되었습니다.", {
													title: "Alert",
													// default
													onClose: null,
													// default
													styleClass: "",
													// default
													initialFocus: null,
													// default
													textDirection: sap.ui.core.TextDirection.Inherit
												});
											},
											error: function (cc3, vv3) {}
										});
									},
									error: function (cc4, vv4) {}
								});
							}
						},
						error: function (cc5, vv5) {}
					});
				},
				error: function (ccvv, vvww) {}
			});
			///////////////////////////////////////////////////////
		},
		/**
		 *@memberOf ProjB.zcbProj004.controller.Modify
		 */
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