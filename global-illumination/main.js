/**
 * Assignment 1 - Global Illumination
 * @author rshriva@ncsu.edu
 *
 */

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// Solve quadratic. Return empty array if no solutions, 
// one t value if one solution, two if two solutions.
function solveQuad(a,b,c) {
    var discr = b*b - 4*a*c; 
    // console.log("a:"+a+" b:"+b+" c:"+c);

    if (discr < 0) { // no solutions
        // console.log("no roots!");
        return([]); 
    } else if (discr == 0) { // one solution
        // console.log("root: "+(-b/(2*a)));
        return([-b/(2*a)]);
    } else { // two solutions
        var denom = 0.5/a;
        var term1 = -b;
        var term2 = Math.sqrt(discr)
        var tp = denom * (term1 + term2);
        var tm = denom * (term1 - term2);
        // console.log("root1:"+tp+" root2:"+tm);
        if (tm < tp)
            return([tm,tp]);
        else
            return([tp,tm]);
    } 
} // end solveQuad

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color[0];
            imagedata.data[pixelindex+1] = color[1];
            imagedata.data[pixelindex+2] = color[2];
            imagedata.data[pixelindex+3] = color[3];
        } else 
            throw "drawpixel color is not a Color";
    } // end try
    
    catch(e) {
        console.log(e);
    }
} // end drawPixel

/**
    Traces the ray starting from origin along ray against the triangle defined by the points a, b, and c. 
    Returns a HitTest with the information or null for no intersection.
    code obtained from 
    https://evanw.github.io/lightgl.js/docs/raytracer.html
*/
function rayTriangleIntersect(origin, ray, triangle) {
    var a = triangle.vertices[0];
    var b = triangle.vertices[1];
    var c = triangle.vertices[2];
    var ab = Vector.subtract(b, a);
    var ac = Vector.subtract(c, a);
    var normal = triangle.normal[0];//Vector.normalize(Vector.cross(ab, ac));
    var t = Vector.dot(normal, Vector.subtract(a, origin)) / Vector.dot(normal, ray);

    if (t > 0) {
        var hit = Vector.add(origin, Vector.scale(t, ray));
        var toHit = Vector.subtract(hit, a);
        var dot00 = Vector.dot(ac, ac);
        var dot01 = Vector.dot(ac, ab);
        var dot02 = Vector.dot(ac, toHit);
        var dot11 = Vector.dot(ab, ab);
        var dot12 = Vector.dot(ab, toHit);
        var divide = dot00 * dot11 - dot01 * dot01;
        var u = (dot11 * dot02 - dot01 * dot12) / divide;
        var v = (dot00 * dot12 - dot01 * dot02) / divide;
        if (u >= 0 && v >= 0 && u + v <= 1) 
            return ({"exists": true, "xyz": hit, "t": t, "normal": normal});  
    }

    return ({"exists": false, "xyz": NaN, "t": NaN, "normal": NaN});
}


// ray sphere intersection
// if no intersect, return NaN
// if intersect, return xyz vector and t value
// intersects in front of clipVal don't count
function raySphereIntersect(ray,sphere,clipVal) {
    try {
        if (!(ray instanceof Array) || !(sphere instanceof Object))
            throw "RaySphereIntersect: ray or sphere are not formatted well";
        else if (ray.length != 2)
            throw "RaySphereIntersect: badly formatted ray";
        else { // valid params
            var a = Vector.dot(ray[1],ray[1]); // dot(D,D)
            var origMctr = Vector.subtract(ray[0],new Vector(sphere.x,sphere.y,sphere.z)); // E-C
            var b = 2 * Vector.dot(ray[1],origMctr); // 2 * dot(D,E-C)
            var c = Vector.dot(origMctr,origMctr) - sphere.r*sphere.r; // dot(E-C,E-C) - r^2
            // if (clipVal == 0) {
            //     ray[0].toConsole("ray.orig: ");
            //     ray[1].toConsole("ray.dir: ");
            //     console.log("a:"+a+" b:"+b+" c:"+c);
            // } // end debug case
        
            var qsolve = solveQuad(a,b,c);
            if (qsolve.length == 0) 
                throw "no intersection";
            else if (qsolve.length == 1) { 
                if (qsolve[0] < clipVal)
                    throw "intersection too close";
                else {
                    var isect = Vector.add(ray[0],Vector.scale(qsolve[0],ray[1]));
                    //console.log("t: "+qsolve[0]);
                    //isect.toConsole("intersection: ");
                    return({"exists": true, "xyz": isect,"t": qsolve[0]});  
                } // one unclipped intersection
            } else if (qsolve[0] < clipVal) {
                if (qsolve[1] < clipVal)
                    throw "intersections too close";
                else { 
                    var isect = Vector.add(ray[0],Vector.scale(qsolve[1],ray[1]));
                    //console.log("t2: "+qsolve[1]);
                    //isect.toConsole("intersection: ");
                    return({"exists": true, "xyz": isect,"t": qsolve[1]});  
                } // one intersect too close, one okay
            } else {
                var isect = Vector.add(ray[0],Vector.scale(qsolve[0],ray[1]));
                //console.log("t1: "+qsolve[0]);
                //isect.toConsole("intersection: ");
                return({"exists": true, "xyz": isect,"t": qsolve[0]});  
            } // both not too close
        } // end if valid params
    } // end try

    catch(e) {
        //console.log(e);
        return({"exists": false, "xyz": NaN, "t": NaN});
    }
} // end raySphereIntersect


function isLightOccluded(L,isectPos,isectSphere,spheres) {
    var s=0; // which sphere
    var lightOccluded = false; // if light is occluded
    var occluderIsect = {}; // occluder intersect details
    // console.log("testing for occlusions");
    
    // check each light up to intersected sphere to see if it occludes
    while ((!lightOccluded) && (s<isectSphere)) { 
        occluderIsect = raySphereIntersect([isectPos,L],spheres[s],0);
        if (!occluderIsect.exists) { // no intersection
            s++; // on to next sphere
        } else if (occluderIsect.t > 1) { // light in front of intersection
            s++; // on to next sphere
        } else {
            lightOccluded = true;
            // console.log("occlusion found from sphere "+isectSphere+" to "+s);
        } // end if occlusion found
    } // while all lights up to one intersected by eye
    
    // check each light after intersected sphere to see if it occludes
    s = isectSphere+1;
    while ((!lightOccluded) && (s<spheres.length)) { 
        occluderIsect = raySphereIntersect([isectPos,L],spheres[s],0);
        // console.log("oisect: "+occluderIsect);
        if (!occluderIsect.exists) { // no intersection
            s++; // on to next sphere
        } else if (occluderIsect.t > 1) { // light in front of intersection
            s++; // on to next sphere
        } else {
            lightOccluded = true;
            // console.log("occlusion found from sphere "+isectSphere+" to "+s);
        } // end if occlusion found
    } // while all lights after one intersected by eye
    
    return(lightOccluded);
} // end is light occluded


// color the passed intersection and sphere
function shadeIsect(isect,isectSphere,lights,spheres, flag) {
    try {
        if (   !(isect instanceof Object) || !(typeof(isectSphere) === "number") 
            || !(lights instanceof Array) || !(spheres instanceof Array))
            throw "shadeIsect: bad parameter passed";
        else {
            var c = new Color(0,0,0,255); // init the sphere color to black
            var sphere = spheres[isectSphere]; // sphere intersected by eye
            // console.log("shading pixel");

            // add light for each source
            var lightOccluded = false; // if an occluder is found
            var Lloc = new Vector(0,0,0);
            for (var l=0; l<lights.length; l++) {

                // add in the ambient light
                c[0] += lights[l].ambient[0] * sphere.ambient[0]; // ambient term r
                c[1] += lights[l].ambient[1] * sphere.ambient[1]; // ambient term g
                c[2] += lights[l].ambient[2] * sphere.ambient[2]; // ambient term b
                
                // check each other sphere to see if it occludes light
                Lloc.set(lights[l].x,lights[l].y,lights[l].z);                
                var L = Vector.subtract(Lloc,isect.xyz); // light vector unnorm'd
                // L.toConsole("L: ");
                // console.log("isect: "+isect.xyz.x+", "+isect.xyz.y+", "+isect.xyz.z);
                // if light isn't occluded
                if (!isLightOccluded(L,isect.xyz,isectSphere,spheres)) {
                    // console.log("no occlusion found");
                    
                    // add in the diffuse light
                    var sphereCenter = new Vector(sphere.x,sphere.y,sphere.z);
                    var N = Vector.normalize(Vector.subtract(isect.xyz,sphereCenter)); // surface normal
                    var diffFactor = Math.max(0,Vector.dot(N,Vector.normalize(L)));
                    if (diffFactor > 0) {
                        c[0] += lights[l].diffuse[0] * sphere.diffuse[0] * diffFactor;
                        c[1] += lights[l].diffuse[1] * sphere.diffuse[1] * diffFactor;
                        c[2] += lights[l].diffuse[2] * sphere.diffuse[2] * diffFactor;
                    } // end nonzero diffuse factor

                    // add in the specular light
                    var V = Vector.normalize(Vector.subtract(Eye,isect.xyz)); // view vector
                    var H = Vector.normalize(Vector.add(L,V)); // half vector
                    var specFactor = Math.max(0,Vector.dot(N,H)); 
                    if (specFactor > 0) {
                        var newSpecFactor = specFactor;
                        for (var s=1; s<spheres[isectSphere].n; s++) // mult by itself if needed
                            newSpecFactor *= specFactor;
                        c[0] += lights[l].specular[0] * sphere.specular[0] * newSpecFactor; // specular term
                        c[1] += lights[l].specular[1] * sphere.specular[1] * newSpecFactor; // specular term
                        c[2] += lights[l].specular[2] * sphere.specular[2] * newSpecFactor; // specular term
                    } // end nonzero specular factor
                    
                    if(flag) {  //cos component for direct light without brdf
                        c[0] *= Math.abs(Vector.dot(N, Vector.normalize(L)));
                        c[1] *= Math.abs(Vector.dot(N, Vector.normalize(L)));
                        c[2] *= Math.abs(Vector.dot(N, Vector.normalize(L)));
                    }
                } // end if light not occluded
            } // end for lights
            
            c[0] = Math.min(1,c[0]/lights.length); // clamp max value to 1
            c[1] = Math.min(1,c[1]/lights.length); // clamp max value to 1
            c[2] = Math.min(1,c[2]/lights.length); // clamp max value to 1

            return(c);
        } // if have good params
    } // end throw
    
    catch(e) {
        console.log(e);
        return(Object.null);
    }
}

// color the passed intersection and triangle
function shadeTriangle(tri,isect,lights,triangles,spheres,flag) {
    try {
        if (   !(isect instanceof Object) || !(typeof(tri) === "number") 
            || !(lights instanceof Array) || !(triangles instanceof Array) || !(spheres instanceof Array))
            throw "shadeTriangle: bad parameter passed";
        else {
            var c = new Color(0,0,0,255); // init the triangle color to black
            var triangle = triangles[tri]; // sphere intersected by eye

            // add light for each source
            var lightOccluded = false; // if an occluder is found
            var Lloc = new Vector(0,0,0);
            for (var l=0; l<lights.length; l++) {

                // add in the ambient light
                c[0] += lights[l].ambient[0] * triangle.ambient[0]; // ambient term r
                c[1] += lights[l].ambient[1] * triangle.ambient[1]; // ambient term g
                c[2] += lights[l].ambient[2] * triangle.ambient[2]; // ambient term b
                
                // check each other sphere to see if it occludes light
                Lloc.set(lights[l].x,lights[l].y,lights[l].z);
                var L = Vector.subtract(Lloc,isect.xyz); // light vector unnorm'd
                // if light isn't occluded
                if (!isLightOccluded(L,isect.xyz,spheres.length+1,spheres)) {
                    // add in the diffuse light
                    var N = isect.normal;
                    var diffFactor = Math.max(0,Vector.dot(N,Vector.normalize(L)));
                    if (diffFactor > 0) {
                        c[0] += lights[l].diffuse[0] * triangle.diffuse[0] * diffFactor;
                        c[1] += lights[l].diffuse[1] * triangle.diffuse[1] * diffFactor;
                        c[2] += lights[l].diffuse[2] * triangle.diffuse[2] * diffFactor;
                    } // end nonzero diffuse factor
                    
                    if(flag) {  //cos component for direct light without brdf
                        c[0] *= Math.abs(Vector.dot(N, Vector.normalize(L)));
                        c[1] *= Math.abs(Vector.dot(N, Vector.normalize(L)));
                        c[2] *= Math.abs(Vector.dot(N, Vector.normalize(L)));
                    }   
                } // end if light not occluded
            } // end for lights

            c[0] = Math.min(1,c[0]/lights.length); // clamp max value to 1
            c[1] = Math.min(1,c[1]/lights.length); // clamp max value to 1
            c[2] = Math.min(1,c[2]/lights.length); // clamp max value to 1

            return(c);
        } // if have good params
    } // end throw
    
    catch(e) {
        console.log(e);
        return(Object.null);
    }
}

function radiance(rayIn, rayOut, index, inputLights, isTriangle) {
    //rayIn = isect.xyz
    //rayOut = Eye
    var color = new Color(0,0,0,255);
    var indirectColor = new Color(0,0,0,255);
    var directColor = new Color(0,0,0,255);

    if(isTriangle) {
        indirectColor = indirectIllumination(rayIn, rayOut, index, inputLights, true);
        directColor = shadeTriangle(index, rayIn, inputLights, inputTriangles, inputSpheres, true);
    } else {
        indirectColor = indirectIllumination(rayIn, rayOut, index, inputLights, false);
        directColor = shadeIsect(rayIn, index, inputLights, inputSpheres, true);
    }
    //console.log("indirectColor");
    //console.log(indirectColor);
    //console.log("directColor");
    //console.log(directColor);

    color[0] = indirectColor[0] + directColor[0];
    color[1] = indirectColor[1] + directColor[1];
    color[2] = indirectColor[2] + directColor[2];

    color[0] = Math.min(1,color[0]); // clamp max value to 1
    color[1] = Math.min(1,color[1]); // clamp max value to 1
    color[2] = Math.min(1,color[2]); // clamp max value to 1
    
    return color;
}

function indirectIllumination(pt, rayOut, s, inputLights, isTriangle) {
    //pt = isect
    //rayOut = Eye
    var c = new Color(0,0,0,255);
    var color = new Color(0,0,0,255);
    var xPt, yPt, zPt, xyz;
    var zeroVector = new Vector(0,0,0);
    var randomXYZ = new Vector(0,0,0);

    if(isTriangle) {
        var N = pt.normal;
    } else {
        var sphere = inputSpheres[s];
        var sphereCenter = new Vector(sphere.x,sphere.y,sphere.z);
        var N = Vector.normalize(Vector.subtract(pt.xyz,sphereCenter)); // surface normal
    }

    var samples = 0, totalSamples = 1;
    var randP = Math.random();

    c.change(0,0,0,255);
    randomXYZ.set(0,0,0);

    while(samples < totalSamples) {

        xPt = Math.random()*2 - 1;
        yPt = Math.random()*2 - 1;
        zPt = Math.random()*2 - 1;
        
        randomXYZ.set(xPt, yPt, zPt);
        xyz = Vector.add(pt.xyz, randomXYZ);

        if(Math.sqrt(xPt*xPt + yPt*yPt + zPt*zPt) < 1 && Math.cos(Vector.dot(N, xyz) > 0)) {
            
            for(j=0; j<inputTriangles.length; j++) {
                
                if(s == j && isTriangle)    continue;

                y = rayTriangleIntersect(pt.xyz,randomXYZ,inputTriangles[j]);
                
                if(y.exists) {
                    //condition for Russian Roulette
                    if(randP >= pBounce)
                        c = shadeTriangle(j,y,inputLights,inputTriangles,inputSpheres,false);
                    else
                        c = radiance(y,randomXYZ,s,inputLights,isTriangle);

                    color[0] += c[0] * Math.abs(Vector.dot(Vector.normalize(Vector.subtract(rayOut, pt.xyz)), randomXYZ) * Vector.dot(N, Vector.normalize(randomXYZ)));
                    color[1] += c[1] * Math.abs(Vector.dot(Vector.normalize(Vector.subtract(rayOut, pt.xyz)), randomXYZ) * Vector.dot(N, Vector.normalize(randomXYZ)));
                    color[2] += c[2] * Math.abs(Vector.dot(Vector.normalize(Vector.subtract(rayOut, pt.xyz)), randomXYZ) * Vector.dot(N, Vector.normalize(randomXYZ)));
                    samples++;
                }
            }
        }
    }

    //console.log(c);
    //clampling the colors
    //if(pBounce > 0) {
        //color[0]/=(totalSamples*pBounce);
        //color[1]/=(totalSamples*pBounce);
        //color[2]/=(totalSamples*pBounce);
    //}
    color[0] = Math.min(1,color[0]/samples);
    color[1] = Math.min(1,color[1]/samples);
    color[2] = Math.min(1,color[2]/samples);

    return color;
}

// use ray casting with spheres to get pixel colors
function rayCastSpheres(context) {
    inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres");
    //var inputLights = getJSONFile(INPUT_LIGHTS_URL,"lights");
    var inputLights = [{"x": 0.5, "y": 0.95, "z": 0.5, "ambient": [1,1,1], "diffuse": [1,1,1], "specular": [1,1,1]}];//,
                        //{"x": 0.5, "y": 0.05, "z": 0.5, "ambient": [1,1,1], "diffuse": [1,1,1], "specular": [1,1,1]}];
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    // console.log("casting rays");

    inputTriangles = 
    [  
        //back
        {"vertices": [new Vector(0,1,1), new Vector(1,1,1), new Vector(1,0,1)], "normal": [new Vector(0,0,-1)], "ambient": [0.1,0.1,0.1], "diffuse": [0.8,0.8,0.8]},
        {"vertices": [new Vector(1,0,1), new Vector(0,0,1), new Vector(0,1,1)], "normal": [new Vector(0,0,-1)], "ambient": [0.1,0.1,0.1], "diffuse": [0.8,0.8,0.8]},
        //right
        {"vertices": [new Vector(1,1,1), new Vector(1,1,0), new Vector(1,0,1)], "normal": [new Vector(-1,0,0)], "ambient": [0.1,0,0], "diffuse": [0.8,0,0]},
        {"vertices": [new Vector(1,1,0), new Vector(1,0,0), new Vector(1,0,1)], "normal": [new Vector(-1,0,0)], "ambient": [0.1,0,0], "diffuse": [0.8,0,0]},
        //left
        {"vertices": [new Vector(0,1,0), new Vector(0,1,1), new Vector(0,0,0)], "normal": [new Vector(1,0,0)], "ambient": [0,0,0.1], "diffuse": [0,0,0.8]},
        {"vertices": [new Vector(0,1,1), new Vector(0,0,1), new Vector(0,0,0)], "normal": [new Vector(1,0,0)], "ambient": [0,0,0.1], "diffuse": [0,0,0.8]},
        //top
        {"vertices": [new Vector(0,1,1), new Vector(1,1,1), new Vector(1,1,0)], "normal": [new Vector(0,-1,0)], "ambient": [0.1,0.1,0.1], "diffuse": [0.8,0.8,0.8]},
        {"vertices": [new Vector(0,1,0), new Vector(0,1,1), new Vector(1,1,0)], "normal": [new Vector(0,-1,0)], "ambient": [0.1,0.1,0.1], "diffuse": [0.8,0.8,0.8]},
        //bottom
        {"vertices": [new Vector(0,0,1), new Vector(1,0,1), new Vector(0,0,0)], "normal": [new Vector(0,1,0)], "ambient": [0.1,0.1,0.1], "diffuse": [0.8,0.8,0.8]},
        {"vertices": [new Vector(1,0,1), new Vector(1,0,0), new Vector(0,0,0)], "normal": [new Vector(0,1,0)], "ambient": [0.1,0.1,0.1], "diffuse": [0.8,0.8,0.8]}
    ];

    if (inputSpheres != String.null) { 
        var x = 0; var y = 0; // pixel coord init
        var n = inputSpheres.length; // the number of spheres
        var Dir = new Vector(0,0,0); // init the ray direction
        var closestT = Number.MAX_VALUE; // init the closest t value
        var c = new Color(0,0,0,255); // init the pixel color
        var color = new Color(0,0,0,255);
        var isect = {}; // init the intersection
        var samples = 0, totalSamples = 25;  //total samples
        var sampleFound = false;
        //console.log("number of spheres: " + n);

        // Loop over the pixels and spheres, intersecting them
        var wx = WIN_LEFT; // init world pixel xcoord
        var wxd = (WIN_RIGHT-WIN_LEFT) * 1/(w-1); // world pixel x differential
        var wy = WIN_TOP; // init world pixel ycoord
        var wyd = (WIN_BOTTOM-WIN_TOP) * 1/(h-1); // world pixel y differential

        for (y=0; y<h; y++) {
            wx = WIN_LEFT; // init w
            for (x=0; x<h; x++) {
                
                samples = 0;
                sampleFound = false;
                c.change(0,0,0,255);

                while(samples < totalSamples) {
                    closestT = Number.MAX_VALUE; // no closest t for this pixel  
                    //Dir.toConsole("Dir: ");
                    Dir.copy(Vector.subtract(new Vector(wx,wy,WIN_Z),Eye)); // set ray direction
                    //console.log(x + " --- " + y);
                    for(var tri=0; tri<inputTriangles.length; tri++) {
                        intersectTri = rayTriangleIntersect(Eye, Dir, inputTriangles[tri]);
                        if(intersectTri.exists) {
                            if(intersectTri.t < closestT) {
                                closestT = intersectTri.t;
                                color = radiance(intersectTri, Eye, tri, inputLights, true);
                                sampleFound = true;
                            }
                        }
                    }

                    for(var s=0; s<n; s++) {
                        isect = raySphereIntersect([Eye,Dir],inputSpheres[s],1);
                        if(isect.exists) {// there is an intersect
                            if(isect.t < closestT) { // it is the closest yet
                                closestT = isect.t; // record closest t yet
                                color = radiance(isect, Eye, s, inputLights, false);
                                sampleFound = true;
                            } // end if closest yet
                        }
                    } // end for spheres

                    if(sampleFound) {
                        c[0] += color[0];
                        c[1] += color[1];
                        c[2] += color[2];
                        sampleFound = false;
                        //console.log("Found" + samples + " >> " + x + " --- " + y);
                    } 
                    samples++;
                    //console.log(samples + " - - " + x + " .... " + y);
                }

                var factor = totalSamples;
                c[0]/=factor;
                c[1]/=factor;
                c[2]/=factor;
                c[0] = 255*Math.min(1,c[0]);
                c[1] = 255*Math.min(1,c[1]);
                c[2] = 255*Math.min(1,c[2]);
                
                drawPixel(imagedata,x,y,c); 
                wx += wxd; 
                //console.log(""); // blank per pixel
            } // end for x
            wy += wyd; 
            console.log("Completed: " + ((y+1)*100)/h + "%");
        } // end for y
        context.putImageData(imagedata, 0, 0);
    } // end if spheres found
} // end ray cast spheres

/* constants and globals */

const WIN_Z = 0;
const WIN_LEFT = 0; const WIN_RIGHT = 1;
const WIN_BOTTOM = 0; const WIN_TOP = 1;
const INPUT_SPHERES_URL = "https://ncsucg4games.github.io/prog1/spheres.json";
    //"https://pages.github.ncsu.edu/bwatson/introcg-prog1/spheres.json";
const INPUT_LIGHTS_URL = "https://ncsucg4games.github.io/prog1/lights.json";
    //"https://pages.github.ncsu.edu/bwatson/introcg-prog1/lights.json";
        
var Eye = new Vector(0.5,0.5,-0.5); // set the eye position
var inputSpheres;
var inputTriangles;
var pBounce = 0.5;    //probability for Russian Roullette

/* main -- here is where execution begins after window load */

function main() {

    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
        
    rayCastSpheres(context); 

}