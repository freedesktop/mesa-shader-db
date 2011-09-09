#version 120
#define saturate(x) clamp(x,0.0,1.0)
#define lerp mix

varying vec3 cubeCoord;


#line 14
uniform samplerCube RGB;
uniform samplerCube Exp;

uniform vec2 scaleBias;

void main(){
	vec3 sky = textureCube(RGB, cubeCoord).rgb;
	float ex = textureCube(Exp, cubeCoord).x;

	// Expand RGBE
	sky *= exp2(ex * scaleBias.x + scaleBias.y);

	gl_FragColor.rgb = sky.rgb;
}

