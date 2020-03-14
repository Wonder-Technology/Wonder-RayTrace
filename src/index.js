var index = (function () {
    function createProgram(gl, vshader, fshader) {
        // Create shader object
        var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        // Create a program object
        var program = gl.createProgram();
        if (!program) {
            return null;
        }

        // Attach the shader objects
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // Link the program object
        gl.linkProgram(program);

        // Check the result of linking
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    }

    function loadShader(gl, type, source) {
        // Create shader object
        var shader = gl.createShader(type);
        if (shader == null) {
            console.log('unable to create shader');
            return null;
        }

        // Set the shader program
        gl.shaderSource(shader, source);

        // Compile the shader
        gl.compileShader(shader);

        // Check the result of compilation
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);
            console.log(source);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }


    // Offscreen float buffers.
    // function createOffscreen(gl, width, height) {
    //     var colorTexture = gl.createTexture();
    //     gl.bindTexture(gl.TEXTURE_2D, colorTexture);
    //     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    //     gl.bindTexture(gl.TEXTURE_2D, null);

    //     var depthBuffer = gl.createRenderbuffer();
    //     gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    //     gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    //     gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    //     var framebuffer = gl.createFramebuffer();
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
    //     gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    //     gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //     return {
    //         framebuffer: framebuffer, colorTexture: colorTexture, depthBuffer: depthBuffer, width: width, height: height, gl: gl,
    //         bind: function () { this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer); this.gl.viewport(0, 0, this.width, this.height); },
    //         unbind: function () { this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null); },
    //         delete: function () { this.gl.deleteRenderbuffer(this.depthBuffer); this.gl.deleteFramebuffer(this.framebuffer); this.gl.deleteTexture(this.colorTexture); }
    //     }
    // }



    return {
        main: (trace_vertex, trace_fragment) => {
            // Retrieve <canvas> element
            var canvas = document.getElementById('canvas');

            // Get the rendering context for WebGL
            var gl = canvas.getContext("webgl2");
            if (!gl) {
                console.log('Failed to get the rendering context for WebGL2');
                return;
            }

            var map1Source = new Image();

            map1Source.src = "./src/assets/images/logo.png";

            map1Source.onload = () => {
                var texture1 = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, texture1);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, map1Source);



                // Create the path tracing program, grab the uniforms.
                var program = createProgram(gl, trace_vertex, trace_fragment);
                var timeLocation = gl.getUniformLocation(program, "uTime");
                var map1Location = gl.getUniformLocation(program, "map1");
                var cameraLookFromLocation = gl.getUniformLocation(program, "cameraLookFrom");
                var cameraLookAtLocation = gl.getUniformLocation(program, "cameraLookAt");
                // var pLocation = gl.getUniformLocation(program, 'proj');
                // var uniformgridLocation = gl.getUniformLocation(program, 'grid');
                // var uniformtrisLocation = gl.getUniformLocation(program, 'tris');
                // var uniformSeed = gl.getUniformLocation(program, 'inseed');
                // var uniformCount = gl.getUniformLocation(program, 'incount');
                // var uniformbbaLocation = gl.getUniformLocation(program, 'bbina');
                // var uniformbbbLocation = gl.getUniformLocation(program, 'bbinb');
                // var uniformresLocation = gl.getUniformLocation(program, 'resolution');


                // Setup the quad that will drive the rendering.
                var vertexPosBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                    -2, 0,
                    0, -2,
                    2, 2
                ]), gl.STATIC_DRAW);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                var vertexArray = gl.createVertexArray();
                gl.bindVertexArray(vertexArray);
                var vertexPosLocation = 0;
                gl.enableVertexAttribArray(vertexPosLocation);
                gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
                gl.vertexAttribPointer(vertexPosLocation, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bindVertexArray(null);




                camera.init(canvas);


                function _frame(time) {


                    gl.useProgram(program);



                    gl.uniform1i(map1Location, 0);
                    gl.uniform1f(timeLocation, 0.001 * time);


                    var [x, y, z] = camera.getLookFrom();
                    console.log("LookFrom:", [x, y, z])
                    gl.uniform3f(cameraLookFromLocation, x, y, z);
                    var [x, y, z] = camera.getTarget();
                    // console.log("target:", [x, y, z])
                    gl.uniform3f(cameraLookAtLocation, x, y, z);


                    gl.bindVertexArray(vertexArray);


                    gl.clearColor(0, 0, 0, 1);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);


                    requestAnimationFrame(_frame);
                };

                requestAnimationFrame(_frame);
            };


        }
    }
}());