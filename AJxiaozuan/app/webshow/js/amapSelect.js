// 最好不要在全局中定义,放在单个函数内或包含多个函数的function中
// 注：此处有问题,需要修改 2018/3/27
"use strict";
// 强制组件加载使用https协议
var AMapUIProtocol = 'https:';
var map = new AMap.Map('map-canvas', {
    center: [114.420125, 30.515376],
    zoom: 11,
    resizeEnable: true
});
map.on('complete', function () {
    console.log("map load success! The centre:" + map.getCenter());
    // 根据窗口大小修改map-canvas高度 18/4/12
    // var navHeight = document.getElementsByClassName('navbar')[0].clientHeight;
    // console.log(navHeight);
    // navHeight:navbar 高度,11:row和navbar上下padding(5 5 0.5 0.5)
    // document.getElementById('map-canvas').style.height = (window.innerHeight - navHeight - 11) + 'px';
    // console.log(document.getElementById('map-canvas').offsetHeight);
});
var rectOptions = {
    strokeStyle: "dashed",
    strokeColor: "#ff5921",
    fillColor: "#37b5ff",
    fillOpacity: 0.5,
    strokeOpacity: 1,
    strokeWeight: 2
};
var markerOptions = {
    draggable: true,
    cursor: 'move',
    clickable: true,
    icon: new AMap.Icon(),
    offset: new AMap.Pixel(-9, -36),//default(-10,-34)
    animation: 'AMAP_ANIMATION_DROP',
    shadow: new AMap.Icon()
};
var polyLineOptions = {
    strokeColor: "#1956ff",//"FF33FF"
    strokeWeight: 2,
    isOutline: true,
    draggable: true,
    showDir: true
};
var textOptions = {
    text: "文本标记内容",
    textAlign: 'center',
    verticalAlign: 'middle',
    offset: new AMap.Pixel(-3, -15),
    angle: 10,
    topWhenClick: true,
    bubble: true,
    draggable: true
};
var rulerOptions = {
    startMarkerOptions: markerOptions,
    endMarkerOptions: markerOptions,
    lineOptions: polyLineOptions
};
var mouseTool = null;
var auto = null;
var placeSearch = null;
var overView = null;
var ruler = null;
var geocoder = null;
var contextMenu = null;
// AMapUI.loadUI(['BasicControl'], function (BasicControl) {
//     zoomCtrl = new BasicControl.Zoom({
//         theme: '',
//         showZoomNum: true,
//         position: 'tr'
//     })
// });
// map.addControl(zoomCtrl);
function init() {
    //异步加载插件
    map.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.MapType'], function () {
        map.addControl(new AMap.ToolBar());
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.MapType());
    });
}
map.plugin(['AMap.MouseTool'], function () {
    mouseTool = new AMap.MouseTool(map);
});

//注册点击时间获取鼠标点击经纬度坐标
var clickEventListener = map.on('click', function (e) {
    document.getElementById("lnglat").value = e.lnglat.getLng() +
        ',' + e.lnglat.getLat();
});
map.plugin(['AMap.Autocomplete'], function () {
    auto = new AMap.Autocomplete({
        input: "searchText"
    });
});
map.plugin(['AMap.OverView'], function () {
    //加载鹰眼
    overView = new AMap.OverView({
        visible: true
    });
    map.addControl(overView);
    overView.open();
});
AMap.service(["AMap.PlaceSearch"], function () {
    placeSearch = new AMap.PlaceSearch({ //构造地点查询类
        pageSize: 5,
        city: "", //城市
        map: map,
        extensions: "all",
        panel: "panel" //"panel"
    });
    //关键字查询
    // placeSearch.search('武汉大学');
});
map.plugin(['AMap.RangingTool'], function () {
    ruler = new AMap.RangingTool(map, rulerOptions);
});
map.plugin(['AMap.Geocoder'], function () {
    geocoder = new AMap.Geocoder({
        radius: 1000,
        extensions: "all"
    });
});
//注册监听输入选择
AMap.event.addListener(auto, "select", select);
function select(e) {
    if (e.poi && e.poi.location) {
        map.setZoom(15);
        map.setCenter(e.poi.location);
        console.log(e.poi.name);
        placeSearch.search(e.poi.name);
    }
}
//设定回车响应按键触发,测试不通过?  18/3/22; 使用bind()/on()方法解决 3/24
$("#searchText").on('keyup', function (event) {
    console.log(event.keyCode);
    if (event.keyCode === 13) {
        $("#searchButton").trigger("click");
        // doSearchClick();
    }
});
//监听输入框输入内容清除,清除搜索结果
$("#searchText").bind('input propertychange', function () {
    if ($("#searchText").val().length === 0) {
        console.log("input clear");
        placeSearch.clear();
    }
});
//输入关键字进行搜索,可重新设计结果展示!
var doSearchClick = function () {
    placeSearch.search(document.getElementById("searchText").value, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            console.log("搜索结果:" + result.poiList.count);
        }
    });
};
//jQuery调用
// $("#searchButton").on('click', doSearchClick());
AMap.event.addDomListener(document.getElementById('searchButton'), 'click', function () {
    placeSearch.search(document.getElementById("searchText").value, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            console.log("搜索结果:" + result.poiList.count);
        }
    });
});
//相关鼠标操作
function iRectZoomIn(checkbox) {
    if (checkbox.checked) {
        //通过rectOptions更改拉框放大时鼠标绘制的矩形框样式
        map.setDefaultCursor("crosshair");
        mouseTool.rectZoomIn(rectOptions);
    }
    else {
        //关闭当前鼠标操作
        mouseTool.close(false);
        map.setDefaultCursor();
    }
}
//鼠标点击标点
function iMarker(checkbox) {
    if (checkbox.checked) {
        map.setDefaultCursor("crosshair");
        mouseTool.marker(markerOptions);
    }
    else {
        mouseTool.close(true);
        map.setDefaultCursor();
    }
}
//鼠标画圆
function iCircle(checkbox) {
    if (checkbox.checked) {
        mouseTool.circle();
    }
    else {
        mouseTool.close(true);
    }
}
//绘制折线
function iPolyLine(checkbox) {
    if (checkbox.checked) {
        mapRightClick(false);
        map.setDefaultCursor("crosshair");
        mouseTool.polyline(polyLineOptions);
    }
    else {
        mapRightClick(true);
        mouseTool.close(true);
        map.setDefaultCursor();
    }
}
//绘制多边形
function iPolygon(checkbox) {
    if (checkbox.checked) {
        mapRightClick(false);
        map.setDefaultCursor("crosshair");
        mouseTool.polygon();
    }
    else {
        mapRightClick(true);
        mouseTool.close(true);
        map.setDefaultCursor();
    }
}
//绘制矩形
function iRectangle(checkbox) {
    if (checkbox.checked) {
        mouseTool.rectangle();
    }
    else {
        mouseTool.close(true);
    }
}
//文本标记
function iText(checkbox) {
    if (checkbox.checked) {
        addText(true);
    }
    else {
        text.setMap(null);
        text = null;
        addText(false);
    }
}
//距离测量
function startRule(checkbox) {
    if (checkbox.checked) {
        mapRightClick(false);
        ruler.turnOn();
    }
    else {
        mapRightClick(true);
        ruler.turnOff();
    }
}
//面积测量
function areaMeasure(checkbox) {
    if (checkbox.checked) {
        mapRightClick(false);
        //mouseTool draw事件{type,obj}
        AMap.event.addListener(mouseTool, 'draw', function (e) {
            var eObject = e.obj;
        });
        mouseTool.measureArea();
    }
    else {
        mapRightClick(true);
        mouseTool.close(true);
    }
}
var text = null;
//定义成全局变量,否则无法在else中删除该监听
var mapClickEvent = null;
function addText(flag) {
    // var mapClickEvent = null;
    var pLng = null, pLat = null;
    if (flag) {
        text = new AMap.Text(textOptions);
        mapClickEvent = AMap.event.addListener(map, 'click', function (e) {
            pLng = e.lnglat.getLng();
            pLat = e.lnglat.getLat();
            if (!text) {
                console.log('text is null');
            }
            else {
                text.setPosition([pLng, pLat]);
                text.setMap(map);
            }
        });
    }
    else {
        if (mapClickEvent) {
            AMap.event.removeListener(mapClickEvent);
            mapClickEvent = null;
        }
    }
}
AMap.event.addDomListener(document.getElementById('addMarker'), 'click', function () {
    myAddMarker(0);
});
AMap.event.addDomListener(document.getElementById('showPicture'), 'click', function () {
    myAddMarker(1);
});
AMap.event.addDomListener(document.getElementById('showGIF'), 'click', function () {
    myAddMarker(2);
});
var pMarker = null;
var mapClickEventListener = null;
//保存多个点标记
var markers = [];
// 创建不同显示的点标记,可批量删除
function myAddMarker(iconIndex) {
    map.setDefaultCursor("crosshair");
    pMarker = new AMap.Marker({
        cursor: 'move',
        draggable: true,
        raiseOnDrag: true,
        animation: 'AMAP_ANIMATION_DROP'
    });
    var myIcon = null;
    if (!myIcon) {
        switch (iconIndex) {
            case 0:
                myIcon = new AMap.Icon();
                break;
            case 1:
                myIcon = new AMap.Icon({
                    size: new AMap.Size(50, 50),
                    image: "images/computer.jpg",
                    imageOffset: new AMap.Pixel(0, 0),
                    imageSize: new AMap.Size(50, 50)
                });
                break;
            case 2:
                myIcon = new AMap.Icon({
                    size: new AMap.Size(50, 50),
                    image: "animations/send.gif",
                    imageOffset: new AMap.Pixel(0, 0),
                    imageSize: new AMap.Size(50, 50)
                });
                break;
            default:
                myIcon = new AMap.Icon();
        }
    }
    pMarker.setIcon(myIcon);
    resetMapClickEvent();
    var addr = null;
    mapClickEventListener = AMap.event.addListener(map, 'click', function (e) {
        if (!pMarker) {
            alert('pMarker is null');
        }
        pMarker.setPosition(e.lnglat);
        pMarker.setTitle('marker的title');
        //回调函数导致返回值不是实时的 18/4/3
        //点标记获取地址信息,但不显示,逆地址编码
        geocoder.getAddress(e.lnglat, function (status, result) {
            if (status === 'complete' && result.info === 'OK') {
                addr = result.regeocode.formattedAddress;
            }
            else {
                addr = 'can not get address';
            }
            //将逆编码地址与点标记进行绑定
            var content = [];
            content.push("经纬度：" + pMarker.getPosition());
            content.push("地址：" + addr);
            pMarker.content = content.join("<br/>");
        });
        pMarker.setMap(map);
        myIcon = null;
        // map.setFitView();

        pMarker.on('click', markerClick);
        // 触发事件,直接将点击信号传出,快速响应
        // pMarker.emit('click', {target: pMarker});
    });
    markers.push(pMarker);

}
function markerClick(e) {
    infoWindow.setContent(e.target.content);
    infoWindow.open(map, e.target.getPosition());
}
//删除所有点标记
function delMarkers() {
    console.log(markers.length);
    map.clearInfoWindow();
    for (let index in markers) {
        //关闭marker的点击事件监听,无输出,失败?无法获取是否添加监听 18/4/2
        map.off('click', markerClick);
        markers[index].setMap(null);
        markers[index] = null;
    }
    markers = [];
    myDelMarker();
}
//删除上面添加的点标记,但只能删除最后一次标记的点
function myDelMarker() {
    if (pMarker) {
        pMarker.setMap(null);
        pMarker = null;
    }
    map.setDefaultCursor();
    resetMapClickEvent();
}
//防止监听事件重复绑定
function resetMapClickEvent() {
    if (mapClickEventListener) {
        AMap.event.removeListener(mapClickEventListener);
        mapClickEventListener = null;
    }
}
var mapRClickEventListener = null;
//创建地图右击菜单
function mapRightClick(status) {
    contextMenu = new AMap.ContextMenu();
    var contextMenuPosition = null;
    if (!mapRClickEventListener) {
        mapRClickEventListener = AMap.event.addListener(map, 'rightclick', function (e) {
            contextMenu.open(map, e.lnglat);
            contextMenuPosition = e.lnglat;
        });
    }
    //尝试控制右键菜单的打开时机? 2018/3/28
    if (!status) {
        if (mapRClickEventListener) {
            AMap.event.removeListener(mapRClickEventListener);
            mapRClickEventListener = null;
        }
        // map.on('rightclick', function (e) {
        //     contextMenu.open(map, e.lnglat);
        //     contextMenuPosition = e.lnglat;
        // });
    }
    contextMenu.addItem("放大一级", function () {
        map.zoomIn();
    }, 0);
    contextMenu.addItem("缩小一级", function () {
        map.zoomOut();
    }, 1);
    contextMenu.addItem("缩放至全国范围", function () {
        map.setZoomAndCenter(4, contextMenuPosition);
    }, 2);
    map.on('click', function () {
        contextMenu.close();
    })
}
mapRightClick(true);
//创建覆盖物右击菜单
function markerRightClick(marker) {
    var contextMenu = new AMap.ContextMenu();
    contextMenu.addItem("编辑", function () {

    }, 0);
    contextMenu.addItem("删除", function () {

    }, 1);
    marker.on('rightclick', function (e) {
        contextMenu.open(map, e.lnglat);
    })
}
//创建信息窗体
var infoWindow = new AMap.InfoWindow({
    autoMove: true,
    closeWhenClickMap: true,
    offset: new AMap.Pixel(0, -30),
    showShadow: true
});
//获取地图缩放级别,显示位置暂未确定?
AMap.event.addListener(map, 'zoomend', function () {
    console.log(map.getZoom());
});
//点聚合,展示大量Marker点
var cluster = [];
var clusterMarkers = [];
function addCluster(checkbox) {
    if (checkbox.checked) {
        console.log(points.length);
        for (var i = 0; i < points.length; ++i) {
            clusterMarkers.push(new AMap.Marker({
                position: points[i]['lnglat'],
                content: '<div style="background-color: hsla(180, 100%, 50%, 0.7);' +
                    'height: 24px;' +
                    'width: 24px;' +
                    'border: 1px solid hsl(180, 100%, 40%);' +
                    'border-radius: 12px;' +
                    'box-shadow: hsl(180, 100%, 50%) 0px 0px 1px;"></div>',
                offset: new AMap.Pixel(-15, -15)
            }))
        }
        var sts = [{
            url: "http://a.amap.com/jsapi_demos/static/images/blue.png",
            size: new AMap.Size(32, 32),
            offset: new AMap.Pixel(-16, -16)
        }, {
            url: "http://a.amap.com/jsapi_demos/static/images/green.png",
            size: new AMap.Size(32, 32),
            offset: new AMap.Pixel(-16, -16)
        }, {
            url: "http://a.amap.com/jsapi_demos/static/images/orange.png",
            size: new AMap.Size(36, 36),
            offset: new AMap.Pixel(-18, -18)
        }, {
            url: "http://a.amap.com/jsapi_demos/static/images/red.png",
            size: new AMap.Size(48, 48),
            offset: new AMap.Pixel(-24, -24)
        }, {
            url: "http://a.amap.com/jsapi_demos/static/images/darkRed.png",
            size: new AMap.Size(48, 48),
            offset: new AMap.Pixel(-24, -24)
        }];
        map.plugin(['AMap.MarkerClusterer'], function () {
            cluster = new AMap.MarkerClusterer(map, clusterMarkers, {
                styles: sts,
                gridSize: 80
            });
        });
        map.setZoomAndCenter(4, map.getCenter());
    }
    else {
        if (cluster) {
            cluster.setMap(null);
        }
    }
}