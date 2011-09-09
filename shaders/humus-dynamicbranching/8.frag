#version 120
#define saturate(x) clamp(x,0.0,1.0)
#define lerp mix
#line 36
uniform sampler2D Base;
uniform sampler2D Bump;
uniform samplerCube ShadowMap;

uniform vec3 lightColor;
uniform vec2 plxCoeffs;
uniform vec4 select;

uniform bool hasParallax;

varying vec2 texCoord;
varying vec3 lVec;
varying vec3 vVec;
varying vec3 shadowVec;

void main(){
	vec3 lighting = vec3(0.0);

	float atten = saturate(1.0 - dot(lVec, lVec));
#ifndef BRANCHING
	atten *= float(lVec.z > 0.0);
#else
	if (atten > 0.0)
	if (lVec.z > 0.0)
#endif
	{

#ifdef SHADOWS
#  ifndef BRANCHING
		atten *= float(length(shadowVec) < dot(textureCube(ShadowMap, shadowVec), select));
#  else
		if (length(shadowVec) < dot(textureCube(ShadowMap, shadowVec), select))
#  endif
#endif
		{
			vec3 lightVec = normalize(lVec);
			vec3 viewVec = normalize(vVec);

			vec2 plxTexCoord = texCoord;
			if (hasParallax){
				float height = texture2D(Bump, texCoord).w;
				float offset = height * plxCoeffs.x + plxCoeffs.y;
				plxTexCoord += offset * viewVec.xy;
			}

			vec3 base = texture2D(Base, plxTexCoord).rgb;
			vec3 bump = texture2D(Bump, plxTexCoord).xyz * 2.0 - 1.0;
			bump = normalize(bump);

			float diffuse = saturate(dot(lightVec, bump));
			float specular = pow(saturate(dot(reflect(-viewVec, bump), lightVec)), 16.0);

			lighting = atten * lightColor * (diffuse * base + 0.6 * specular);
		}
	}
	gl_FragColor.rgb = lighting;
}

