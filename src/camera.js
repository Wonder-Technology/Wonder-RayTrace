var camera = (function () {
    var _phi = Math.PI / 2;
    var _theta = Math.PI / 2;
    var _target = [0.0, 0.0, 0.0];
    var _rotateSpeed = 1;
    // var _movementSpeedX = 1;
    // var _movementSpeedY = 1;
    var _wheelSpeed = 1;
    var _distance = 30;
    var _minDistance = 0.05;

    var _isDrag = false;


    function _getMovementDelta(e) {
        return [e.movementX, e.movementY];
    }

    function _changeOrbit(e) {
        var [x, y] = _getMovementDelta(e);
        console.log([x, y])

        _phi += x / (100 / _rotateSpeed);
        _theta -= y / (100 / _rotateSpeed);
    }

    function _bindDragStartEvent(canvas) {
        canvas.onmousedown = (e) => {
            _isDrag = true;
            canvas.requestPointerLock();
        };
    }

    function _bindDragOverEvent(canvas) {
        canvas.onmousemove = (e) => {
            if (!_isDrag) {
                return;
            }

            _changeOrbit(e);
        };
    }

    function _bindDragDropEvent(canvas) {
        canvas.onmouseup = (e) => {
            _isDrag = false;
            document.exitPointerLock();
        };
    }


    return {
        init: (canvas) => {
            _bindDragStartEvent(canvas);
            _bindDragOverEvent(canvas);
            _bindDragDropEvent(canvas);
        },
        getLookFrom: () => {
            return [
                _distance * Math.cos(_phi) * Math.sin(_theta) + _target[0],
                _distance * Math.cos(_theta) + _target[1],
                _distance * Math.sin(_phi) * Math.sin(_theta) + _target[2],
            ]
        },
        getTarget: () => {
            return _target
        }
    }
}());