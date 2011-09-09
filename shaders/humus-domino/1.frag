#version 120
#define saturate(x) clamp(x,0.0,1.0)
#define lerp mix
#line 18
uniform sampler2D Base;
uniform sampler2D Bump;

uniform float fade;

varying vec2 texCoord;
varying vec3 lVec;

void main(){
	vec3 lightVec = normalize(lVec);
	vec3 viewVec = lightVec;

	float atten = saturate(1.0 / (1.0 + dot(lVec, lVec)) - 0.1);

	vec4 base = texture2D(Base, texCoord);
	vec3 bump = texture2D(Bump, texCoord).xyz;
	vec3 normal = normalize(bump * 2.0 - 1.0);

	float diffuse = saturate(dot(lightVec, normal));
	float specular = pow(diffuse, 16.0);

	gl_FragColor = fade * atten * ((diffuse * 0.7 + 0.3) * base + 0.5 * specular);
}

