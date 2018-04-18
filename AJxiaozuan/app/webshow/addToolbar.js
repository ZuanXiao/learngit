/**
 * Created with WebStorm(copy)
 * Date: 2018/2/28 10:15
 */
window.onload = function() {
    map.plugin(["AMap.ToolBar"], function() {
        map.addControl(new AMap.ToolBar());
    });
    if(location.href.indexOf('&guide=1')!==-1){
        map.setStatus({scrollWheel:false})
    }
}