var trace_fragment = `#version 300 es
      precision highp float;
      precision highp int;

    in vec2 uv;
    out vec4 fragColor;

uniform float uTime;

uniform sampler2D map1;

#define FLT_MAX 3.402823466e+38
#define T_MIN .001
#define T_MAX FLT_MAX

// #define MAX_HIT_DEPTH 50//50
// #define NUM_SAMPLES 5
// #define NUM_SPHERES 5


#define MAX_HIT_DEPTH 3
// #define NUM_SAMPLES 5
#define NUM_SPHERES 3

#define PI 3.141592653589793


vec2 gRandSeed;


/*
 * Camera
 */

struct Camera {
    vec3 origin;
    vec3 horizontal;
    vec3 vertical;
    vec3 lowerLeft;
};



/*
 * Materials
 */

#define LAMBERT 1
#define METAL 2
// #define DIALECTRIC 3

struct Material {
    int type;
    vec3 albedo;
    float fuzz;
    float refIdx;
};

Material LambertMaterial = Material(
    LAMBERT,
    vec3(0.5),
    0.,
    0.
);

Material ShinyMetalMaterial = Material(
    METAL,
    vec3(0.8),
    0.01,
    0.
);

// Material FuzzyMetalMaterial = Material(
//     METAL,
//     vec3(0.9),
//     0.3,
//     0.
// );

// Material GlassMaterial = Material(
//     DIALECTRIC,
//     vec3(1.),
//     0.,
//     1.5 //1.7
// );



/*
 * Sphere handling
 */

struct Sphere {
    vec3 center;
    float radius;
    Material material;
    vec3 color;
};



struct Ray {
    vec3 origin;
    vec3 dir;
};


struct HitRecord {
    bool hasHit;
    float hitT;
    vec3 hitPoint;
    vec3 normal;

    Material material;
    vec3 color;
    vec2 uv;
};


/*
 * Ray handling
 */

vec3 getRayDirection(Camera camera, vec2 uv) {
    return camera.lowerLeft + uv.x * camera.horizontal + uv.y * camera.vertical;
}

vec3 pointOnRay(Ray ray, float t) {
    return ray.origin + t*ray.dir;
}



float random(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy ,vec2(a,b));
    highp float sn = mod(dt,3.14);

    return fract(sin(sn) * c);
}

float rand() {
    // gRandSeed.x  = fract(sin(dot(gRandSeed.xy + 0., vec2(12.9898, 78.233))) * 43758.5453);
    // gRandSeed.y  = fract(sin(dot(gRandSeed.xy + 0., vec2(12.9898, 78.233))) * 43758.5453);;

    gRandSeed.x = random(gRandSeed);
    gRandSeed.y = random(gRandSeed);

    return gRandSeed.x;
}



// random direction in unit sphere (i.e. lambert brdf)
// from: https://codepen.io/kakaxi0618/pen/BOqvNj
// this uses spherical coords, see:
// https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/geometry/spherical-coordinates-and-trigonometric-functions

vec3 randomPointInUnitSphere() {
    float phi = 2.0 * PI * rand();
    // random in range [0, 1] => random in range [-1, 1]
    float cosTheta = 2.0 * rand() - 1.0;
    float u = rand();

    float theta = acos(cosTheta);
    float r = pow(u, 1.0 / 3.0);

    // convert from spherical to cartesian
    float x = r * sin(theta) * cos(phi);
    float y = r * sin(theta) * sin(phi);
    float z = r * cos(theta);

    return vec3(x, y, z);
}



vec4 valueTexture(sampler2D sampler, vec2 uv){
    return texture(sampler, uv);
}


    vec2 getSphereUv(vec3 p) {
        float phi = atan(p.z, p.x);
        float theta = asin(p.y);

        float xOffsetAngle = 0.; //1.4;
        float yOffsetAngle = 0.;

        float u = 1. - (phi + xOffsetAngle + PI) / (2. * PI);
        float v = (theta + yOffsetAngle + PI/2.) / PI;

        return vec2(u, v);
    }



void scatter(HitRecord hitRecord, inout vec3 color, inout Ray ray) {
    if(hitRecord.material.type == LAMBERT) {
        // get lambertian random reflection direction
        ray.dir = hitRecord.normal + randomPointInUnitSphere();
        // color *= hitRecord.material.albedo * hitRecord.color;
        color *= hitRecord.material.albedo * valueTexture(
            map1,
            hitRecord.uv
        ).rgb;
    }

    if(hitRecord.material.type == METAL) {
        vec3 reflected = reflect(normalize(ray.dir), hitRecord.normal);
        vec3 dir = reflected + hitRecord.material.fuzz * randomPointInUnitSphere();

        // dot(a, b) > 0 if a and b are pointing "in the same direction"
        if(dot(dir, hitRecord.normal) > 0.) {
            ray.dir = dir;
            color *= hitRecord.material.albedo * hitRecord.color;
        }
    }

    // if(hitRecord.material.type == DIALECTRIC) {
    //     float cosine;
    //     float niOverNt;
    //     float reflectProb;

    //     vec3 outwardNormal;

    //     if(dot(ray.dir, hitRecord.normal) > 0.) {
    //         outwardNormal = -hitRecord.normal;
    //         niOverNt = hitRecord.material.refIdx;
    //         cosine = hitRecord.material.refIdx * dot(ray.dir, hitRecord.normal) / length(ray.dir);
    //     } else {
    //         outwardNormal = hitRecord.normal;
    //         niOverNt = 1. / hitRecord.material.refIdx;
    //         cosine = -dot(ray.dir, hitRecord.normal) / length(ray.dir);
    //     }

    //     vec3 refracted = refract(normalize(ray.dir), normalize(outwardNormal), niOverNt);
    //     if(refracted.x != 0.0 && refracted.y != 0.0 && refracted.z != 0.0) {
    //         reflectProb = schlick(cosine, hitRecord.material.refIdx);
    //     } else {
    //         reflectProb = 1.;
    //     }

    //     if(rand() < reflectProb) {
    //         vec3 reflected = reflect(ray.dir, hitRecord.normal);
    //         ray.dir = reflected;
    //     } else {
    //         ray.dir = refracted;
    //     }

    //     color *= hitRecord.material.albedo * hitRecord.color;
    // }
}





bool hitSphere(Ray ray, Sphere sphere, out HitRecord hitRecord) {
    vec3 oc = ray.origin - sphere.center;

    float a = dot(ray.dir, ray.dir);
    float b = 2. * dot(oc, ray.dir);
    float c = dot(oc, oc) - sphere.radius * sphere.radius;

    float discriminant = b*b - 4.*a*c;

    if(discriminant > 0.) {
        float t;

        t = (-b - sqrt(discriminant)) / (2. * a);
        if(t < T_MAX && t > T_MIN) {
            hitRecord.hasHit = true;
            hitRecord.hitPoint = pointOnRay(ray, t);
            hitRecord.normal = normalize(
                (hitRecord.hitPoint - sphere.center) / sphere.radius
            );

            hitRecord.material = sphere.material;
            hitRecord.color = sphere.color;
            hitRecord.hitT = t;
            hitRecord.uv = getSphereUv(hitRecord.hitPoint);

            return true;
        }

        t = (-b + sqrt(discriminant)) / (2. * a);
        if(t < T_MAX && t > T_MIN) {
            hitRecord.hasHit = true;
            hitRecord.hitPoint = pointOnRay(ray, t);
            hitRecord.normal = normalize(
                (hitRecord.hitPoint - sphere.center) / sphere.radius
            );

            hitRecord.material = sphere.material;
            hitRecord.color = sphere.color;
            hitRecord.hitT = t;
            hitRecord.uv = getSphereUv(hitRecord.hitPoint);

            return true;
        }
    }

    hitRecord.hasHit = false;
    return false;
}


/*
 * World
 */

bool hitWorld(Ray ray, Sphere spheres[NUM_SPHERES], out HitRecord hitRecord) {
    for(int i = 0; i < NUM_SPHERES; i++) {
        if(hitSphere(ray, spheres[i], /* out */ hitRecord)) {
            return true;
        }
    }

    return false;
}


vec3 background(vec3 rayDir) {
    vec3 normedDir = normalize(rayDir);
    // transpose y range from [-1, 1] to [0, 1]
    float t = .5*(normedDir.y + 1.);
    // do linear interpolation of color
    return (1. - t)*vec3(1.) + t*vec3(.4, .4, .7); //vec3(.5, .7, 1.);
}



// colorize
vec3 paint(in Ray ray, Sphere spheres[NUM_SPHERES]) {
    vec3 color = vec3(1.0);
    HitRecord hitRecord;

    hitWorld(ray, spheres, /* out => */ hitRecord);

    for(int hitCounts = 0; hitCounts < MAX_HIT_DEPTH; hitCounts++) {
        if(!hitRecord.hasHit) {
            color *= background(ray.dir);
            break;
        }

        ray.origin = hitRecord.hitPoint;

        scatter(hitRecord, /* out => */ color, /* out => */ ray);
        hitWorld(ray, spheres, /* out => */ hitRecord);
    }

    return color;
}


vec3 trace(in Camera camera, in Sphere spheres[NUM_SPHERES]) {
    vec3 color = vec3(0.0);

    // // trace
    // for(int i = 0; i < NUM_SAMPLES; i++) {
    //     vec2 rUv = vec2( // jitter for anti-aliasing
    //         uv.x + (rand() / uResolution.x),
    //         uv.y + (rand() / uResolution.y)
    //     );

    //     Ray ray = Ray(camera.origin, getRayDirection(camera, rUv));
    //     color += deNan(paint(ray, spheres));
    // }

    // color /= float(NUM_SAMPLES);


        Ray ray = Ray(camera.origin, getRayDirection(camera, uv));
        
        // why use deNan?
        // color += deNan(paint(ray, spheres));
        color += paint(ray, spheres);

    return color;
}


void main () {
    vec3 color;
    // set initial seed for stateful rng
    gRandSeed = uv;

    Camera camera = Camera(
        vec3(0.), // origin
        vec3(4., 0., 0.), // horizontal
        vec3(0., 2., 0.), // vertical
        vec3(-2., -1., -1.) // lower left corner
    );

    Sphere spheres[NUM_SPHERES];
    {
        spheres[0] = Sphere(
            vec3(-0.1, -0.25 + 0.25*0.5*abs(sin(uTime*3.)), -1.), // sphere center
            0.25, // radius
            ShinyMetalMaterial, // material
            vec3(1.) // color
        );
        spheres[1] = Sphere(
            vec3(1., 0. + 0.25*0.5*abs(cos(uTime*3.+1.3*PI)), -1.), // sphere center
            0.5, // radius
            LambertMaterial, //ShinyMetalMaterial, // material
            vec3(0.2, 0.331, 0.5) // color
        );

        // spheres[3] = Sphere(
        //     vec3(0.1, 0.25 + 0.25*0.5*abs(sin(uTime*3.)), -1.7), // sphere center
        //     0.5, // radius
        //     FuzzyMetalMaterial, // material
        //     vec3(0.9, 0.9, 0.9) // color
        // );

        // spheres[2] = Sphere(
        //     vec3(-1., 0.25*abs(sin(uTime*3.+1.5*PI)), -1.25), // sphere center
        //     0.5, // radius
        //     GlassMaterial,
        //     vec3(1.)

        // );
        spheres[2] = Sphere(
            vec3(0., -100.5, -1.),
            100.0,
            LambertMaterial,
            vec3(0.9, 0.3, 0.6)
        );
    }

    color = trace(camera, spheres);
    color = sqrt(color); // correct gamma

    fragColor = vec4(color, 1.);
}`