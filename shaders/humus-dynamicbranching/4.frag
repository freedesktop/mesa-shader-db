#version 120
#define saturate(x) clamp(x,0.0,1.0)
#define lerp mix
#define LIGHT_COUNT 3
#line 43
uniform sampler2D Base;
uniform sampler2D Bump;
uniform samplerCube ShadowMap;

uniform vec3 lightColor[LIGHT_COUNT];
uniform vec2 plxCoeffs;

uniform bool hasParallax;

varying vec3 lVec[LIGHT_COUNT];
varying vec2 texCoord;
varying vec3 vVec;
#ifdef SHADOWS
varying vec3 shadowVec[LIGHT_COUNT];
#endif

void main(){
//	float atten[LIGHT_COUNT];
	vec3 atten;
	for (int i = 0; i < LIGHT_COUNT; i++){
		atten[i] = 1.0 - dot(lVec[i], lVec[i]);
	}
	atten = max(atten, 0.0);


	vec3 viewVec = normalize(vVec);

	vec2 plxTexCoord = texCoord;
	if (hasParallax){
		float height = texture2D(Bump, texCoord).w;
		float offset = height * plxCoeffs.x + plxCoeffs.y;
		plxTexCoord += offset * viewVec.xy;
	}

	vec3 base = texture2D(Base, plxTexCoord).rgb;
	vec3 lighting = 0.1 * base;

#ifdef BRANCHING
	if (dot(atten, atten) > 0.0)
#endif
	{

		vec3 bump = texture2D(Bump, plxTexCoord).xyz * 2.0 - 1.0;
		bump = normalize(bump);
		vec3 reflVec = reflect(-viewVec, bump);

		for (int i = 0; i < LIGHT_COUNT; i++){
#ifndef BRANCHING
			atten[i] *= float(lVec[i].z > 0.0);
#else
			if (atten[i] > 0.0)
			if (lVec[i].z > 0.0)
#endif
			{

#ifdef SHADOWS
#  ifndef BRANCHING
				atten[i] *= float(length(shadowVec[i]) < textureCube(ShadowMap, shadowVec[i])[i]);
#  else
				if (length(shadowVec[i]) < textureCube(ShadowMap, shadowVec[i])[i])
#  endif
#endif
				{
					vec3 lightVec = normalize(lVec[i]);

					float diffuse = saturate(dot(lightVec, bump));
					float specular = pow(saturate(dot(reflVec, lightVec)), 16.0);

					lighting += atten[i] * lightColor[i] * (diffuse * base + 0.6 * specular);
				}
			}
		}
	}

	gl_FragColor.rgb = lighting;
}

