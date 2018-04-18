var imageLayerSW = [114.36691,30.539627], imageLayerNE = [114.395234,30.553228];
var imageLayer = new AMap.ImageLayer({
    url: "images/cherryBlossom.jpg",
    map: map,
    bounds: new AMap.Bounds(imageLayerSW,imageLayerNE),
    zIndex: 100,
    zooms: [8, 16]
});
// console.log(imageLayer.getElement());
function imageLayerShow(checkbox) {
    if(checkbox.checked) {
        //设置地图图层数组,叠加多个图层需要实例化一个TileLayer类
        map.setLayers([new AMap.TileLayer(),imageLayer]);
        imageLayer.show();
        map.setZoomAndCenter(13,imageLayerSW);
    }
    else {
        imageLayer.setMap(null);
    }
}