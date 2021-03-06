/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/TileContainer",
	"sap/m/StandardTile",
	"sap/m/CustomTile",
	"sap/m/library",
	"jquery.sap.mobile",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"sap/m/Tile",
	"jquery.sap.global"
], function(
	qutils,
	createAndAppendDiv,
	TileContainer,
	StandardTile,
	CustomTile,
	mobileLibrary,
	jQuery,
	Device,
	JSONModel,
	Tile
) {
	// shortcut for jQuery.device.is
	var is = jQuery.device.is;
	var $ = jQuery;

	createAndAppendDiv("uiArea1").setAttribute("style", "width: 600px; height: 480px");
	createAndAppendDiv("uiArea2");
	var styleElement = document.createElement("style");
	styleElement.textContent =
		".small_60x100 { /* in order to guarantee that the tiles will all be shown/fit into the parent container uiArea1 */" +
		"	width: 60px !important;" +
		"	height: 100px; !important;" +
		"}";
	document.head.appendChild(styleElement);


	var core = sap.ui.getCore();
	var delay = 500;

	QUnit.test("ShouldRenderNiceHtml", function(assert) {
		// SUT
		var id,
			expectedWidth = "100px",
			expectedHeight = "200px",
			sut = new TileContainer({
					width : expectedWidth,
					height : expectedHeight
				});

		sut.placeAt("qunit-fixture");
		id = sut.getId();

		// Act
		core.applyChanges();

		// Assert
		assert.strictEqual(sut.$().css("width"),expectedWidth);
		assert.strictEqual(sut.$().css("height"),expectedHeight);

		assert.ok($("#" + id + "-scrl").length > 0);
		assert.ok($("#" + id + "-blind").length > 0);
		assert.ok($("#" + id + "-cnt").length > 0);
		assert.ok($("#" + id + "-pager").length > 0);


		sut.destroy();
	});

	QUnit.test("Should Render One Tile and it should be visible", function(assert) {
		// Arrange
		var tile1 = new StandardTile(),
			sut;

		// SUT
		sut = new TileContainer({tiles : [tile1]});

		// Act
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// Assert
		//The only that contains a tile id is id+ "-remove" that's why it's retrived like this
		assert.equal($("#" + tile1.getId() + "-remove").length,1, "tile is rendered");
		assert.equal($("#" + tile1.getId() + "-remove").css("visibility"), "visible", "tile is visible");

		// Cleanup
		sut.destroy();
	});

	QUnit.test("ShouldRenderMultipleTiles", function(assert) {
		// Arrange
		var tile1 = new StandardTile(),
			tile2 = new CustomTile(),
			sut;


		// SUT
		sut = new TileContainer({tiles : [tile1,tile2]});


		// Act
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// Assert
		//The only that contains a tile id is id+ "-remove" that's why it's retrived like this
		assert.equal($("#" + tile1.getId() + "-remove").length,1);
		assert.equal($("#" + tile2.getId() + "-remove").length,1);

		// Cleanup
		sut.destroy();
	});

	QUnit.test("ShouldSetEditable", function(assert) {
		// Arrange
		var tile1 = new StandardTile(),
			tile2 = new CustomTile(),
			tiles = [tile1,tile2],
			sut,
			i;

		// SUT
		sut = new TileContainer({tiles : tiles});

		// Act
		sut.placeAt("qunit-fixture");
		core.applyChanges();
		sut.setEditable(true);

		// Assert
		assert.ok(sut.$().hasClass("sapMTCEditable"));
		assert.ok(sut.getEditable());
		for ( i = 0; i < tiles.length; i++) {
			assert.equal(tiles[i].isEditable(),true);
		}

		// Cleanup
		sut.destroy();

	});

	QUnit.test("ShouldMoveATile", function(assert) {
		var done = assert.async();
		// Arrange
		var m = sap.m,
			tile0 = new m.StandardTile(),
			tile1 = new m.CustomTile(),
			tiles = [tile0,tile1],
			sut;

		// SUT
		sut = new m.TileContainer({tiles : tiles});

		// Act
		sut.placeAt("qunit-fixture");
		core.applyChanges();
		setTimeout(function(){
			sut.moveTile(tile0,1);

			// Assert
			assert.strictEqual(sut.getTiles()[0], tile1);
			assert.strictEqual(sut.getTiles()[1], tile0);


			// Cleanup
			sut.destroy();
			done();
		}, delay);
	});

	QUnit.test("ShouldInsertATile", function(assert) {
		// Arrange
		var sut,
			m = sap.m,
			tileToAdd = new m.StandardTile();

		// SUT
		sut = new m.TileContainer();

		// Act
		sut.placeAt("qunit-fixture");
		core.applyChanges();
		sut.addTile(tileToAdd);

		// Assert
		assert.strictEqual(sut.getTiles()[0], tileToAdd);

		// Cleanup
		sut.destroy();
	});

	QUnit.test("ShouldDeleteATile", function(assert) {
		// Arrange
		var sut,
			m = sap.m,
			tileToDelete = new m.StandardTile();

		// SUT
		sut = new m.TileContainer({
			tiles : tileToDelete
		});

		// Act
		sut.placeAt("qunit-fixture");
		core.applyChanges();
		sut.deleteTile(tileToDelete);

		// Assert
		assert.strictEqual(sut.getTiles().length, 0);

		// Cleanup
		sut.destroy();
	});

	QUnit.test("ShouldApplyDimensions", function(assert) {
		var done = assert.async();
		// Arrange
		var sut,
			id,
			oDim,
			$rightEdge,
			$leftEdge,
			$scroll,
			pagerHeight,
			m = sap.m,
			expectedOffset = is.phone ? 2 : 0,
			tile = new m.StandardTile();

		// SUT
		sut = new m.TileContainer({
			tiles : tile
		});

		// Act
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// Assert
		//timeout needed to have the content at its actual size
		setTimeout(function(){
			sut._applyDimension();
			id = sut.getId();
			oDim = sut._getDimension();
			pagerHeight = jQuery.sap.byId( id + "-pager").outerHeight();

			assert.equal(sut.$().css("visibility"),"visible","TileContainer was visible");

			$scroll = jQuery.sap.byId(id + "-scrl");
			assert.equal($scroll.css("width"), oDim.outerwidth + "px","scroll width");
			assert.equal($scroll.css("height"), (oDim.outerheight - pagerHeight) + "px","scroll height");


			$rightEdge = jQuery.sap.byId(id + "-rightedge");
			assert.equal($rightEdge.css("top"), (sut.getDomRef().offsetTop + expectedOffset) + "px","right edge top");
			assert.equal($rightEdge.css("right"),expectedOffset + "px");

			$leftEdge = jQuery.sap.byId(id + "-leftedge");
			assert.equal($leftEdge.css("top"), (sut.getDomRef().offsetTop + expectedOffset) + "px","left edge top");
			assert.equal($leftEdge.css("left"),expectedOffset + "px");

			// Cleanup
			sut.destroy();
			done();
		},delay);
	});

	QUnit.module("ShouldScrollIntoAView");

	QUnit.test("Given 2 pages and scrolling to the second", function(assert) {
		var done = assert.async();
		//Arrange
		var sut,
			m = sap.m,
			lastTile;


		//SUT
		sut = new m.TileContainer({tiles : new m.StandardTile()});
		sut.placeAt("uiArea1"); //with of uiArea1 is 600px, will fit 2 tiles x 210px (12 rem + 2x8 margins + 2x1 borders. If changed in less, should be reflected here)
		core.applyChanges();
		setTimeout(function() {
			sut._calculatePageSize();

			//Add one more Tile than total amount of Tiles fitting in the current container
			while (sut._iMaxTiles + 1 > sut.getTiles().length){
				lastTile = new m.StandardTile();
				sut.addTile(lastTile);
				sut._calculatePageSize();
			}

			//Act
			// scroll to the page where the last tile will be
			sut.scrollIntoView(lastTile,false);

			var aRenderedTiles = sut.$().find(".sapMTCCnt").children();

			//Assert
			assert.equal(sut._oPagesInfo.getCurrentPage(), 1, "..should update the this._oPagesInfo.getCurrentPage()");
			assert.equal(sut._iMaxTiles, sut.getPageFirstTileIndex(), "..should calculate this._iMaxTiles");
			assert.equal(aRenderedTiles.length, 3, "..should render 3 tiles in the DOM");
			assert.ok(!!lastTile.getDomRef(), "..should render last tile in the DOM");
			assert.equal(aRenderedTiles.last()[0], lastTile.getDomRef(), "..should render last tile as last tile's DOM element");

			//Cleanup
			sut.destroy();
			done();
		}, delay);

	});

	QUnit.test("Given 2 pages, scrolling to the second, then toggle TC visibility", function(assert) {
		var done = assert.async();
		//Arrange
		var sut,
			m = sap.m,
			lastTile;


		//SUT
		sut = new m.TileContainer({tiles : new m.StandardTile()});
		sut.placeAt("uiArea1"); //with of uiArea1 is 600px, will fit 2 tiles x 210px (12 rem + 2x8 margins + 2x1 borders. If changed in less, should be reflected here)
		core.applyChanges();
		setTimeout(function() {
			sut._calculatePageSize();

			//Add one more Tile than total amount of Tiles fitting in the current container
			while (sut._iMaxTiles + 1 > sut.getTiles().length){
				lastTile = new m.StandardTile();
				sut.addTile(lastTile);
				sut._calculatePageSize();
			}

			//Act
			// scroll to the page where the last tile will be
			sut.scrollIntoView(lastTile,false);
			sut.setVisible(false);
			core.applyChanges();
			sut.setVisible(true);

			core.applyChanges();

			//Assert
			assert.equal(sut.$("pager").children().length, 2, "..should render 2 dots");
			assert.notOk(sut.$("pager").children()[0].classList.contains("sapMTCActive"), "..1st dot should not be active");
			assert.ok(sut.$("pager").children()[1].classList.contains("sapMTCActive"), "..2nd dot should be active");

			//Cleanup
			sut.destroy();
			done();
		}, delay);
	});

	QUnit.test("Given 2 pages, scrolling to the second, adding more tiles to make pages 3, then toggle TC visibility", function(assert) {
		var done = assert.async();
		//Arrange
		var sut,
			m = sap.m,
			lastTile;


		//SUT
		sut = new m.TileContainer({tiles : new m.StandardTile()});
		sut.placeAt("uiArea1"); //with of uiArea1 is 600px, will fit 2 tiles x 210px (12 rem + 2x8 margins + 2x1 borders. If changed in less, should be reflected here)
		core.applyChanges();
		setTimeout(function() {
			sut._calculatePageSize();

			//Add one more Tile than total amount of Tiles fitting in the current container
			while (sut._iMaxTiles + 1 > sut.getTiles().length){
				lastTile = new m.StandardTile();
				sut.addTile(lastTile);
			}
			core.applyChanges();

			//Act
			// scroll to the page where the last tile will be
			sut.scrollIntoView(lastTile,false);

			//Add 2 more tiles so that a third page appears (second is active)
			sut.addTile(new m.StandardTile());
			sut.addTile(new m.StandardTile());

			sut.setVisible(false);
			core.applyChanges();
			sut.setVisible(true);
			core.applyChanges();

			//Assert
			assert.ok(sut.$("rightscroller").is(":visible"), "..right scroller should be visible");
			assert.ok(sut.$("leftscroller").is(":visible"), "..right scroller should be visible");

			//Cleanup
			sut.destroy();
			done();
		}, delay);
	});

	QUnit.test('TilesShouldHaveTheSameOrderInTheDomAsInTheAggregation', function (assert) {
		var done = assert.async();
		// SUT
		var m 	  	= sap.m,
			sut 	= new m.TileContainer('testOrder', {
					tiles : [
						new m.StandardTile({id: 'first'}),
						new m.StandardTile({id: 'second'}),
						new m.StandardTile({id: 'third'}),
						new m.StandardTile({id: 'fourth'}),
						new m.StandardTile({id: 'fifth'}),
						new m.StandardTile({id: 'sixth'})
					]
				});

		sut.placeAt("qunit-fixture");

		// Act
		core.applyChanges();
		setTimeout(function() {
			sut.moveTile(sut.getTiles()[0], 3);
			var aTilesDom = jQuery('#testOrder').find('.sapMTile');

			// Assert that the index of the tile in the DOM is the same as the index of aggregation
			assert.equal(sut.getTiles()[3].getId(), jQuery(aTilesDom[3]).attr('id'), 'first, first; equal success');

			sut.destroy();
			done();
		}, delay);
	});

	QUnit.test('Test setting first tile to visible false', function (assert) {
		var done = assert.async();
		// SUT
		var m 	= sap.m,
			sut 	= new m.TileContainer('testOrderVis', {
					tiles : [
						new m.StandardTile({id: 'first', visible: false}),
						new m.StandardTile({id: 'second'}),
						new m.StandardTile({id: 'third'})
					]
				});

		sut.placeAt("qunit-fixture");

		// Act
		core.applyChanges();
		setTimeout(function() {
			var aTilesDom = jQuery('#testOrderVis').find('.sapMTile');

			// Assert that the second tile in the aggregation is first in the DOM, since the first has visible set to false
			assert.equal(aTilesDom.eq(0).attr('id'), 'second', 'first tile in the DOM is the second one, since the first is not visible');

			// Assert that the tiles in the DOM are only two not three like in aggregation, when one of the tiles is not visible
			assert.equal(aTilesDom.length, 2, 'only 2 tiles are rendered inside the DOM');

			sut.destroy();
			done();
		}, delay);
	});

	QUnit.module("Tile common dimension calculation", {
		beforeEach: function () {
			this.prepare();
		},
		afterEach: function () {
			this.clean();
		},
		prepare : function() {
			this.sandbox = sinon.sandbox.create();
			this.sOriginalTheme = sap.ui.getCore().getConfiguration().getTheme();
			// SUT
			this.sut = new TileContainer('testOrder', {
				tiles: [
					new StandardTile({id: 'first'}),
					new StandardTile({id: 'second'})
				]
			});
		},
		clean : function() {
			sap.ui.getCore().applyTheme(this.sOriginalTheme);
			this.sandbox.restore();
			this.sut.destroy();
		},
		mockElementWidthAndHeight : function (iWidth, iHeight) {
			if (this.oStubWidth) {
				this.oStubWidth.restore();
			}
			this.oStubWidth = this.sandbox.stub(jQuery.fn, "outerWidth", function () {
				return iWidth;
			});

			if (this.oStubHeight) {
				this.oStubHeight.restore();
			}
			this.oStubHeight = this.sandbox.stub(jQuery.fn, "outerHeight", function () {
				return iHeight;
			});
		},
		callAndTest : function(oFnThatProvokesTileDimensionChanges, args, assert) {
			var done = assert.async();
			//mock
			this.mockElementWidthAndHeight(3, 5);
			// Act
			this.sut.placeAt("qunit-fixture");
			core.applyChanges();
			setTimeout(function() {
				var sRealTileDimension = this.sut._oTileDimensionCalculator.getLastCalculatedDimension();
				assert.equal(3, sRealTileDimension.width, "Width check");
				assert.equal(5, sRealTileDimension.height, "Height check");

				// "change" the tile's dimension and verify they didn't take place unless an event that
				// provokes change occurs
				this.mockElementWidthAndHeight(30, 50);
				sRealTileDimension = this.sut._oTileDimensionCalculator.getLastCalculatedDimension();
				assert.equal(sRealTileDimension.width, 3, "Tile's width should retain the same as before");
				assert.equal(sRealTileDimension.height, 5, "Tile's height should retain the same as before");

				//provoke real tile dimension change

				oFnThatProvokesTileDimensionChanges.apply(this.sut, args);
				setTimeout(function() {
					sRealTileDimension = this.sut._oTileDimensionCalculator.getLastCalculatedDimension();
					assert.equal(sRealTileDimension.width, 30, "Tile's width should be changed.");
					assert.equal(sRealTileDimension.height, 50, "Tile's height should be changed.");
					done();
				}.bind(this), 1000);
			}.bind(this), 1000);
		}
	});
	QUnit.test('Tile dimension gets updated upon orientation changes', function (assert) {
		var done = assert.async();
		//emulate device that supports orientation change
		var bOrigTablet = Device.system.tablet;
		var bOrigDesktop = Device.system.desktop;
		sap.ui.Device.system.tablet = true;
		sap.ui.Device.system.desktop = false;

		this.clean();
		this.prepare();
		setTimeout(function(){
			this.callAndTest(this.sut._fnOrientationChange, [], assert);
			sap.ui.Device.system.tablet = bOrigTablet;
			sap.ui.Device.system.desktop = bOrigDesktop;
			done();
		}.bind(this), delay);
	});

	QUnit.test('Tile dimension gets updated upon themeChanges handler called', function (assert) {
		this.callAndTest(this.sut.onThemeChanged, [], assert);
	});

	QUnit.test('Tile dimension gets updated upon real theme change', function (assert) {
		this.callAndTest(sap.ui.getCore().applyTheme, ["sap_hcb"], assert);
	});

	QUnit.module("Accessibility attributes", {
		getAriaPosInSetValues: function() {
			return this.sut.getTiles().map(function (tile) {
				return tile.$().attr('aria-posinset');
			});
		},
		getExpectedAriaPositionInSetValues: function() {
			return this.sut.getTiles().map(function(oTile, iIndex) {
				return (iIndex + 1).toString();
			});
		},
		beforeEach: function() {
			var m = sap.m;
			this.sut = new m.TileContainer("tcAcc", {
				tiles: [
					new m.StandardTile({id: 'first'}).addStyleClass("small_60x100"),
					new m.StandardTile({id: 'second'}).addStyleClass("small_60x100"),
					new m.StandardTile({id: 'third'}).addStyleClass("small_60x100"),
					new m.StandardTile({id: 'fourth'}).addStyleClass("small_60x100"),
					new m.StandardTile({id: 'fifth'}).addStyleClass("small_60x100"),
					new m.StandardTile({id: 'sixth'}).addStyleClass("small_60x100")
				]
			});

			// SUT
			this.sut.placeAt("uiArea1");
			// Act
			core.applyChanges();
		},
		afterEach: function() {
			this.sut.destroy();
		}
	});
	QUnit.test('ShouldHaveAccessibilityAttributes', function (assert) {
		var tile1 	= this.sut.getTiles()[0];
		// Assert
		assert.equal(this.sut.$().attr('role'), 'listbox', 'listbox, listbox; equal success');
		assert.equal(this.sut.$().attr('aria-multiselectable'), "false", 'false, false; equal success');
		assert.equal(this.sut.$().attr('aria-activedescendant'), "first");
		// Assert
		assert.equal(tile1.$().attr('aria-posinset'), 1, '1, 1; equal success');
		assert.equal(tile1.$().attr('aria-setsize'), this.sut.getTiles().length, 'aria-setsize');
	});

	QUnit.test('TilesShouldHaveProperAccessibilityPositionAttributeValueAfterReordering', function (assert) {
		var done = assert.async();
		// SUT
		// build an array with the "aria-posinset" values for each tile
		// Act
		setTimeout(function(){
			var aInsetPositions = this.getAriaPosInSetValues(),
				aExpectedAriaPosInSetValues = this.getExpectedAriaPositionInSetValues();

			// Assert that there are 6 tiles with aria-posinset attribute
			assert.equal(aInsetPositions.length, "6", '6, 6; equal success');

			// Assert that all tiles have aria-posinset attribute with proper values:
			// no duplicates and proper numeric order

			assert.deepEqual(aInsetPositions, aExpectedAriaPosInSetValues, "Checking the 'aria-posinset' for exact values");

			// Assert that all tiles have aria-posinset attribute with proper values
			// after a tile has changed its position from left to right
			this.sut.moveTile(this.sut.getTiles()[0], 3);
			assert.deepEqual(this.getAriaPosInSetValues(), aExpectedAriaPosInSetValues, "Checking the 'aria-posinset' for exact values");
			// Assert that the tile was actually moved
			assert.equal(this.sut.getTiles()[3].getId(), 'first', 'first, first; equal success');


			// Assert that all tiles have aria-posinset attribute with proper values
			// after a tile has changed its position from right to left
			this.sut.moveTile(this.sut.getTiles()[4], 1);
			assert.deepEqual(this.getAriaPosInSetValues(), aExpectedAriaPosInSetValues, "Checking the 'aria-posinset' for exact values");

			// Assert that the tile was actually moved
			assert.equal(this.sut.getTiles()[1].getId(), 'fifth', 'fifth, fifth; equal success');
			done();
		}.bind(this), delay);
	});

	QUnit.test("Deletion of tile updates the aria-posinset and aria-setsize attributes", function(assert) {
		var done = assert.async();
		var oTile2 = this.sut.getTiles()[2];

		setTimeout(function(){
			this.sut.deleteTile(oTile2);
			assert.deepEqual(this.getAriaPosInSetValues(), this.getExpectedAriaPositionInSetValues(), "Checking the 'aria-posinset' for exact values");
			oTile2.destroy();
			done();
		}.bind(this), delay);
	});

	QUnit.test("Deletion of a tile keeps the focus", function(assert) {
		var done = assert.async(),
			oTile2 = this.sut.getTiles()[2],
			oTile3 = this.sut.getTiles()[3],
			oJQueryFocusSpy = sinon.spy(jQuery.fn, "focus");

		this.sut.setEditable(true);
		this.sut._iCurrentFocusIndex = 2;

		setTimeout(function() {
			this.sut.onsapdelete({ stopPropagation: function() { } });
			assert.equal(oJQueryFocusSpy.getCall(0).thisValue.attr("id"), oTile3.getId(), "focus is called on the next item");
			oTile2.destroy();
			done();
		}.bind(this), delay);
	});

	QUnit.test("Insert of tile updates the aria-posinset and aria-setsize attributes", function(assert) {
		var oNewTile = new StandardTile();
		this.sut.insertTile(oNewTile, 4);

		assert.deepEqual(this.getAriaPosInSetValues(), this.getExpectedAriaPositionInSetValues(), "Checking the 'aria-posinset' for exact values");
	});

	QUnit.test("Add of tile updates the aria-posinset and aria-setsize attributes", function(assert) {
		//Arrange
		this.sut.removeTile(this.sut.getTiles()[0]);// remove the first tile to free up space for rendering of new tile
		//Act
		var oNewTile = new StandardTile();
		this.sut.addTile(oNewTile);
		assert.deepEqual(this.getAriaPosInSetValues(), this.getExpectedAriaPositionInSetValues(), "Checking the 'aria-posinset' for exact values");
	});

	QUnit.module("Data Binding", {
		beforeEach: function () {
			this.sandbox = sinon.sandbox;
			sap.ui.getCore().setModel(new JSONModel({
				"TileCollection" : [
					{
						"icon" : "hint",
						"type" : "Monitor",
						"title" : "1"
					},
					{
						"icon" : "inbox",
						"type" : "Create",
						"number" : "89",
						"title" : "2",
						"info" : "Overdue",
						"infoState" : "Error"
					},
					{
						"type" : "Create",
						"title" : "3",
						"info" : "28 Days Left",
						"infoState" : "Success"
					},
					{
						"type" : "Create",
						"title" : "4",
						"info" : "28 Days Left",
						"infoState" : "Success"
					},
					{
						"type" : "Create",
						"title" : "5",
						"info" : "28 Days Left",
						"infoState" : "Success"
					}
				]
			}));
			this.oTileContainer = new TileContainer();
			this.oTileContainer.bindAggregation('tiles', '/TileCollection', new StandardTile({
				type: "{type}",
				title: "{title}",
				info: "{info}",
				infoState: "{infoState}",
				number: "{number}",
				icon: "{icon}"
			}));
			this.oTileContainer.placeAt('qunit-fixture');
		},
		afterEach: function () {
			this.oTileContainer.destroy();
			this.sandbox.restore();
		}
	});

	QUnit.test("Tiles are destroyed when model is changed", function (assert) {
		//Arrange
		var fnDestroyTilesSpy = this.sandbox.spy(this.oTileContainer, 'destroyTiles'),
			newDataModel = new JSONModel({
				"TileCollection" : [
					{
						"icon" : "hint",
						"type" : "Create",
						"title" : "2222222222"
					}
				]
			});

		sap.ui.getCore().setModel(newDataModel);
		//Assert
		assert.strictEqual(fnDestroyTilesSpy.callCount, 1, "Tiles are destroyed when data model was updated");
	});

	QUnit.test('Paging is updated, when model is changed', function (assert) {
		var done = assert.async();

		setTimeout(function(){
			assert.strictEqual(this.oTileContainer._oPagesInfo.getCount(), 1, "There is one page");

			newDataModel = new JSONModel({});

			sap.ui.getCore().setModel(newDataModel);

			assert.strictEqual(this.oTileContainer._oPagesInfo.getCount(), 0, "There are no pages after the model was updated with empty data");

			done();
		}.bind(this), delay);
	});

	QUnit.module("Private state and functions", {
		beforeEach: function() {
			this.oTC = new TileContainer();
			this.oSut = this.oTC._oPagesInfo;
		},
		afterEach: function() {
			this.oTC.destroy();
		}
	});

	QUnit.test("_oPagesInfo initial values", function(assert) {
		//Assert
		assert.equal(this.oSut.getCount(),  undefined, "Page count");
		assert.equal(this.oSut.getOldCount(), undefined, "Old page count");
		assert.equal(this.oSut.pageCountChanged(), false, "Page count changed");

		assert.equal(this.oSut.getCurrentPage(), undefined, "Current page");
		assert.equal(this.oSut.getOldCurrentPage(), undefined, "Old current page");
		assert.equal(this.oSut.currentPageChanged(), false, "Current page changed");

		assert.equal(this.oSut.currentPageIsFirst(), false, "Current page is first");
		assert.equal(this.oSut.oldCurrentPageIsFirst(), false, "Old current page is first");
		assert.equal(this.oSut.currentPageIsFirstChanged(), false, "Current page is first changed");

		assert.equal(this.oSut.currentPageIsLast(), false, "Current page is last");
		assert.equal(this.oSut.oldCurrentPageIsLast(), false, "Old current page is last");
		assert.equal(this.oSut.currentPageIsLastChanged(), false, "Current page is last changed");

		assert.equal(this.oSut.isPagerCreated(), false, "Pager created");
	});

	QUnit.test("_oPagesInfo setters change the value", function(assert) {

		//Act
		this.oSut.setCount(10);
		this.oSut.setCurrentPage(3);
		this.oSut.setPagerCreated(true);

		//Assert
		assert.equal(this.oSut.getCount(), 10, "Page count");
		assert.equal(this.oSut.getOldCount(), undefined, "Old page count");
		assert.equal(this.oSut.pageCountChanged(), true, "Page count changed");

		assert.equal(this.oSut.getCurrentPage(), 3, "Current page");
		assert.equal(this.oSut.getOldCurrentPage(), undefined, "Old current page");
		assert.equal(this.oSut.currentPageChanged(), true, "Current page changed");

		assert.equal(this.oSut.currentPageIsFirst(), false, "Current page is first");
		assert.equal(this.oSut.oldCurrentPageIsFirst(), false, "Old current page is first");
		assert.equal(this.oSut.currentPageIsFirstChanged(), false, "Current page is first changed");

		assert.equal(this.oSut.currentPageIsLast(), false, "Current page is last");
		assert.equal(this.oSut.oldCurrentPageIsLast(), false, "Old current page is last");
		assert.equal(this.oSut.currentPageIsLastChanged(), false, "Current page is last changed");
		assert.equal(this.oSut.currentPageRelativePositionChanged(), false, "Current page's relative position changed");

		assert.equal(this.oSut.isPagerCreated(), true, "Pager created");
	});


	QUnit.test("_oPages current page is the last page", function(assert) {
		//Arrange
		this.oSut.setCount(10);
		this.oSut.setCurrentPage(3);
		this.oSut.setPagerCreated(true);

		//Act
		this.oSut.setCurrentPage(9);

		assert.equal(this.oSut.getCount(), 10, "Page count");
		assert.equal(this.oSut.getOldCount(), undefined, "Old page count");
		assert.equal(this.oSut.pageCountChanged(), true, "Page count changed");

		assert.equal(this.oSut.getCurrentPage(), 9, "Current page");
		assert.equal(this.oSut.getOldCurrentPage(), 3, "Old current page");
		assert.equal(this.oSut.currentPageChanged(), true, "Current page changed");

		assert.equal(this.oSut.currentPageIsFirst(), false, "Current page is first");
		assert.equal(this.oSut.oldCurrentPageIsFirst(), false, "Old current page is first");
		assert.equal(this.oSut.currentPageIsFirstChanged(), false, "Current page is first changed");

		assert.equal(this.oSut.currentPageIsLast(), true, "Current page is last");
		assert.equal(this.oSut.oldCurrentPageIsLast(), false, "Old current page is last");
		assert.equal(this.oSut.currentPageIsLastChanged(), true, "Current page is last changed");
		assert.equal(this.oSut.currentPageRelativePositionChanged(), true, "Current page's relative position changed");

		assert.equal(this.oSut.isPagerCreated(), true, "Pager created");
	});

	QUnit.test("_oPagesInfo syncOldToCurrentValues", function(assert) {

		//Arrange
		this.oSut.setCount(10);
		this.oSut.setCurrentPage(3);
		this.oSut.setPagerCreated(true);
		this.oSut.setCurrentPage(9);

		//Act
		this.oSut.syncOldToCurrentValues();

		//Assert
		assert.equal(this.oSut.getCount(), 10, "Page count");
		assert.equal(this.oSut.getOldCount(), 10, "Old page count");
		assert.equal(this.oSut.pageCountChanged(), false, "Page count changed");

		assert.equal(this.oSut.getCurrentPage(), 9, "Current page");
		assert.equal(this.oSut.getOldCurrentPage(), 9, "Old current page");
		assert.equal(this.oSut.currentPageChanged(), false, "Current page changed");

		assert.equal(this.oSut.currentPageIsFirst(), false, "Current page is first");
		assert.equal(this.oSut.oldCurrentPageIsFirst(), false, "Old current page is first");
		assert.equal(this.oSut.currentPageIsFirstChanged(), false, "Current page is first changed");

		assert.equal(this.oSut.currentPageIsLast(), true, "Current page is last");
		assert.equal(this.oSut.oldCurrentPageIsLast(), true, "Old current page is last");
		assert.equal(this.oSut.currentPageIsLastChanged(), false, "Current page is last changed");

	});

	QUnit.test("_oPagesInfo.reset()", function(assert) {
		//Act
		this.oSut.reset();
		//Assert

		assert.equal(this.oSut.getCount(),  undefined, "Page count");
		assert.equal(this.oSut.getOldCount(), undefined, "Old page count");
		assert.equal(this.oSut.pageCountChanged(), false, "Page count changed");

		assert.equal(this.oSut.getCurrentPage(), undefined, "Current page");
		assert.equal(this.oSut.getOldCurrentPage(), undefined, "Old current page");
		assert.equal(this.oSut.currentPageChanged(), false, "Current page changed");

		assert.equal(this.oSut.currentPageIsFirst(), false, "Current page is first");
		assert.equal(this.oSut.oldCurrentPageIsFirst(), false, "Old current page is first");
		assert.equal(this.oSut.currentPageIsFirstChanged(), false, "Current page is first changed");

		assert.equal(this.oSut.currentPageIsFirst(), false, "Current page is first");
		assert.equal(this.oSut.oldCurrentPageIsFirst(), false, "Old current page is first");
		assert.equal(this.oSut.currentPageIsFirstChanged(), false,  "Current page is first changed");

		assert.equal(this.oSut.currentPageIsLast(), false, "Current page is last");
		assert.equal(this.oSut.oldCurrentPageIsLast(), false, "Old current page is last");
		assert.equal(this.oSut.currentPageIsLastChanged(), false, "Current page is last changed");

		assert.equal(this.oSut.isPagerCreated(), false, "Pager created");
	});

	QUnit.test("onBeforeRendering", function(assert) {

		//SUT
		var aSut = [new StandardTile(), new StandardTile()],
			oTC = new TileContainer({tiles: aSut}),
			oSpyPagesInfoReset = sinon.spy(oTC._oPagesInfo, "reset");

		oTC.placeAt('qunit-fixture');

		//Act
		oTC.onBeforeRendering();

		//Assert
		aSut.forEach(function(oSutTile) {
			assert.equal(oSutTile._rendered, false, "Before rendering of TileContainer all tiles are marked as non-rendered flag (._rendered=false)");
		});
		assert.equal(oSpyPagesInfoReset.callCount, 1, "Before rendering the oPagesInfo object should be reset");

		//Cleanup
		oSpyPagesInfoReset.restore();
		oTC.destroy();
	});

	QUnit.test("Parent container does not define width/height", function(assert) {
		//Prepare
		var oClock = this.sandbox.useFakeTimers(),
			done = assert.async(),
			aTiles = [
				new StandardTile({title: "first"}), new StandardTile({title: "second"}),
				new StandardTile({title: "thirth"}), new StandardTile({title: "forth"}),
				new StandardTile({title: "fifth"}), new StandardTile({title: "sixth"})],
			oSut = new TileContainer({height: "100%"});

		jQuery("#uiArea2").css("width", "0px");
		jQuery("#uiArea2").css("height", "0px");

		oSut.placeAt('uiArea2');
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			//Pre-assert
			assert.equal(oSut._iMaxTiles, 1, "Max Tile should remain with its default value");

			//Act
			aTiles.forEach(function (oTile) {
				oSut.addTile(oTile);
			});
			jQuery("#uiArea2").width("515px"); //2 x 210px (12 rem + 2x8 margins + 2x1 borders. If changed in less, should be reflected here)
			jQuery("#uiArea2").height("15rem"); //1 standard tile x 14 rem (if changed in less, should be reflected here)
			sap.ui.getCore().applyChanges();

			//Assert
			setTimeout(function () {
				assert.equal(oSut._iMaxTiles, 2, "Max Tile should be recalculated once there is a height defined");

				//Cleanup
				oClock.restore();
				oSut.destroy();
				done();
			}, 150);
			oClock.tick(200);//make sure rerendering and resize callbacks were passed
		}, 150);

		oClock.tick(200);//make sure rendering and resize callbacks were passed
	});

	QUnit.module("Performance optimizations", {
		beforeEach: function () {
			//Sets uiarea size so it can show 2 StandardTile per page + 90px space for navigation buttons
			jQuery("#uiArea2").width("515px"); //2 x 210px (12 rem + 2x8 margins + 2x1 borders. If changed in less, should be reflected here)
			jQuery("#uiArea2").height("15rem"); //1 standard tile x 14 rem (if changed in less, should be reflected here)

			var aTiles = [
						new StandardTile("id0", {title: "first"}), new StandardTile("id1", {title: "second"}),
						new StandardTile("id2", {title: "thirth"}), new StandardTile("id3", {title: "forth"}),
						new StandardTile("id4", {title: "fifth"}), new StandardTile("id5", {title: "sixth"})];
			this.oSut = new TileContainer("TCPerformanceRocket", {tiles: aTiles});
			this.oSut.placeAt('uiArea2');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.oSut.destroy();
		}
	});

	QUnit.test("Initial rendering renders only the tiles that should be visible on the 1st page", function(assert) {

		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 2, "Render only the tiles of the initial page");
		assert.equal(this.oSut.$("pager").children().size(), 3, "Pager: total count is correct");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), true, "The first page is active");

	});

	QUnit.test("Navigation after initial rendering should lazily render needed tiles", function(assert) {
		//Act
		this.oSut.$("rightscroller").click();

		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 4, "After forward button click the rendered 2 tiles more, so now are 4");
		assert.equal(this.oSut.$("pager").children().size(), 3, "Pager: total count is correct");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), false, "The first page is not active anymore");
		assert.equal(this.oSut.$("pager").children().eq(1).hasClass("sapMTCActive"), true, "The second page is active");

		//Act
		this.oSut.$("leftscroller").click();

		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 4, "After backward button click no new tiles are rendered (still 4)");
		assert.equal(this.oSut.$("pager").children().size(), 3, "Pager: total count is correct");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), true, "The first page become active again");
		assert.equal(this.oSut.$("pager").children().eq(1).hasClass("sapMTCActive"), false, "The second page is not active anymore");
		assert.equal(this.oSut.$("leftscroller").is(":visible"), false, "When on the first page, backward button should not be visible");

		//Act - go the to last page
		this.oSut.$("rightscroller").click();
		this.oSut.$("rightscroller").click();

		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 6, "After navigation to the last page 2 more tiles are rendered, so now are 6");
		assert.equal(this.oSut.$("pager").children().size(), 3, "Pager: total count is correct");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), false, "The first page is not active");
		assert.equal(this.oSut.$("pager").children().eq(1).hasClass("sapMTCActive"), false, "The second page is not active");
		assert.equal(this.oSut.$("pager").children().eq(2).hasClass("sapMTCActive"), true, "The second page is active");
		assert.equal(this.oSut.$("rightscroller").is(":visible"), false, "When on the last page, forward button should not be visible");
	});

	QUnit.test("Add/Insert tile after initial rendering", function(assert) {

		this.oSut.addTile(new StandardTile("id6", {title: "seventh"}));

		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 2, "Adding a tile to the last page does not render new tiles nor rearranges them");
		assert.equal(this.oSut.$("pager").children().size(), 4, "Pager: total count is increased to 4, as this tile is the 7th where 2 tiles per page are rendered");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), true, "The first page is active");

		//Act
		this.oSut.insertTile(new StandardTile("id7", {title: "eight"}), 1);

		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 3, "Adding a tile to the to the current page renders it and does not destroy the one that goes outside the page");
		assert.equal(this.oSut.$("pager").children().size(), 4, "Pager: total count is increased to 4, as this tile is the 7th where 2 tiles per page are rendered");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), true, "The first page is active");
	});

	QUnit.test("Delete tile", function(assert) {
		//Act
		this.oSut.deleteTile(this.oSut.getTiles()[1]);

		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 2, "Removing the second tile at the active page will render new");
		assert.equal(document.getElementById('id1'), null, "The second tile should not be part of the DOM");
		assert.ok(document.getElementById('id2'), "The third tile should be rendered");
		assert.equal(this.oSut.$("pager").children().size(), 3, "Pager: total count is not changed");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), true, "The first page is active");


		//Act
		this.oSut.deleteTile(sap.ui.getCore().byId('id5')); //delete the six tile, now we have only 4 left
		//Assert
		assert.equal(this.oSut.$("cnt").children().size(), 2, "Removing the last tile at the inactive page does not change the rendered tiles");
		assert.equal(document.getElementById('id5'), null, "The last tile should not be part of the DOM");
		assert.equal(this.oSut.$("pager").children().size(), 2, "Pager: total count is not changed");
		assert.equal(this.oSut.$("pager").children().first().hasClass("sapMTCActive"), true, "The first page is active");
	});

	QUnit.module("Misc");

	QUnit.test("When the TileContainer is editable, the Tile also is", function (assert) {
		// Sut
		var editableSut = new Tile(),
			notEditableSut = new Tile(),
			editableCnt = new TileContainer({
				editable: true,
				tiles: editableSut
			}),
			notEditableCnt = new TileContainer({
				tiles: notEditableSut
			});

		// Assert
		assert.equal(editableSut.isEditable(), true, 'The tile is editable');
		assert.equal(notEditableSut.isEditable(), false, 'The tile not editable');

		// Destroy
		editableCnt.destroy();
		notEditableCnt.destroy();
	});
});