
float exp_blender(float f)
{
	return pow(2.71828182846, f);
}

void rgb_to_hsv(vec4 rgb, out vec4 outcol)
{
	float cmax, cmin, h, s, v, cdelta;
	vec3 c;

	cmax = max(rgb[0], max(rgb[1], rgb[2]));
	cmin = min(rgb[0], min(rgb[1], rgb[2]));
	cdelta = cmax-cmin;

	v = cmax;
	if (cmax!=0.0)
		s = cdelta/cmax;
	else {
		s = 0.0;
		h = 0.0;
	}

	if (s == 0.0) {
		h = 0.0;
	}
	else {
		c = (vec3(cmax, cmax, cmax) - rgb.xyz)/cdelta;

		if (rgb.x==cmax) h = c[2] - c[1];
		else if (rgb.y==cmax) h = 2.0 + c[0] -  c[2];
		else h = 4.0 + c[1] - c[0];

		h /= 6.0;

		if (h<0.0)
			h += 1.0;
	}

	outcol = vec4(h, s, v, rgb.w);
}

void hsv_to_rgb(vec4 hsv, out vec4 outcol)
{
	float i, f, p, q, t, h, s, v;
	vec3 rgb;

	h = hsv[0];
	s = hsv[1];
	v = hsv[2];

	if(s==0.0) {
		rgb = vec3(v, v, v);
	}
	else {
		if(h==1.0)
			h = 0.0;
		
		h *= 6.0;
		i = floor(h);
		f = h - i;
		rgb = vec3(f, f, f);
		p = v*(1.0-s);
		q = v*(1.0-(s*f));
		t = v*(1.0-(s*(1.0-f)));
		
		if (i == 0.0) rgb = vec3(v, t, p);
		else if (i == 1.0) rgb = vec3(q, v, p);
		else if (i == 2.0) rgb = vec3(p, v, t);
		else if (i == 3.0) rgb = vec3(p, q, v);
		else if (i == 4.0) rgb = vec3(t, p, v);
		else rgb = vec3(v, p, q);
	}

	outcol = vec4(rgb, hsv.w);
}

#define M_PI 3.14159265358979323846

/*********** SHADER NODES ***************/

void vcol_attribute(vec4 attvcol, out vec4 vcol)
{
	vcol = vec4(attvcol.x/255.0, attvcol.y/255.0, attvcol.z/255.0, 1.0);
}

void uv_attribute(vec2 attuv, out vec3 uv)
{
	uv = vec3(attuv*2.0 - vec2(1.0, 1.0), 0.0);
}

void geom(vec3 co, vec3 nor, mat4 viewinvmat, vec3 attorco, vec2 attuv, vec4 attvcol, out vec3 global, out vec3 local, out vec3 view, out vec3 orco, out vec3 uv, out vec3 normal, out vec4 vcol, out float frontback)
{
	local = co;
	view = normalize(local);
	global = (viewinvmat*vec4(local, 1.0)).xyz;
	orco = attorco;
	uv_attribute(attuv, uv);
	normal = -normalize(nor);	/* blender render normal is negated */
	vcol_attribute(attvcol, vcol);
	frontback = 1.0;
}

void mapping(vec3 vec, mat4 mat, vec3 minvec, vec3 maxvec, float domin, float domax, out vec3 outvec)
{
	outvec = (mat * vec4(vec, 1.0)).xyz;
	if(domin == 1.0)
		outvec = max(outvec, minvec);
	if(domax == 1.0)
		outvec = min(outvec, maxvec);
}

void camera(vec3 co, out vec3 outview, out float outdepth, out float outdist)
{
	outdepth = abs(co.z);
	outdist = length(co);
	outview = normalize(co);
}

void math_add(float val1, float val2, out float outval)
{
	outval = val1 + val2;
}

void math_subtract(float val1, float val2, out float outval)
{
	outval = val1 - val2;
}

void math_multiply(float val1, float val2, out float outval)
{
	outval = val1 * val2;
}

void math_divide(float val1, float val2, out float outval)
{
	if (val2 == 0.0)
		outval = 0.0;
	else
		outval = val1 / val2;
}

void math_sine(float val, out float outval)
{
	outval = sin(val);
}

void math_cosine(float val, out float outval)
{
	outval = cos(val);
}

void math_tangent(float val, out float outval)
{
	outval = tan(val);
}

void math_asin(float val, out float outval)
{
	if (val <= 1.0 && val >= -1.0)
		outval = asin(val);
	else
		outval = 0.0;
}

void math_acos(float val, out float outval)
{
	if (val <= 1.0 && val >= -1.0)
		outval = acos(val);
	else
		outval = 0.0;
}

void math_atan(float val, out float outval)
{
	outval = atan(val);
}

void math_pow(float val1, float val2, out float outval)
{
	if (val1 >= 0.0)
		outval = pow(val1, val2);
	else
		outval = 0.0;
}

void math_log(float val1, float val2, out float outval)
{
	if(val1 > 0.0  && val2 > 0.0)
		outval= log2(val1) / log2(val2);
	else
		outval= 0.0;
}

void math_max(float val1, float val2, out float outval)
{
	outval = max(val1, val2);
}

void math_min(float val1, float val2, out float outval)
{
	outval = min(val1, val2);
}

void math_round(float val, out float outval)
{
	outval= floor(val + 0.5);
}

void math_less_than(float val1, float val2, out float outval)
{
	if(val1 < val2)
		outval = 1.0;
	else
		outval = 0.0;
}

void math_greater_than(float val1, float val2, out float outval)
{
	if(val1 > val2)
		outval = 1.0;
	else
		outval = 0.0;
}

void squeeze(float val, float width, float center, out float outval)
{
	outval = 1.0/(1.0 + pow(2.71828183, -((val-center)*width)));
}

void vec_math_add(vec3 v1, vec3 v2, out vec3 outvec, out float outval)
{
	outvec = v1 + v2;
	outval = (abs(outvec[0]) + abs(outvec[1]) + abs(outvec[2]))/3.0;
}

void vec_math_sub(vec3 v1, vec3 v2, out vec3 outvec, out float outval)
{
	outvec = v1 - v2;
	outval = (abs(outvec[0]) + abs(outvec[1]) + abs(outvec[2]))/3.0;
}

void vec_math_average(vec3 v1, vec3 v2, out vec3 outvec, out float outval)
{
	outvec = v1 + v2;
	outval = length(outvec);
	outvec = normalize(outvec);
}

void vec_math_dot(vec3 v1, vec3 v2, out vec3 outvec, out float outval)
{
	outvec = vec3(0, 0, 0);
	outval = dot(v1, v2);
}

void vec_math_cross(vec3 v1, vec3 v2, out vec3 outvec, out float outval)
{
	outvec = cross(v1, v2);
	outval = length(outvec);
}

void vec_math_normalize(vec3 v, out vec3 outvec, out float outval)
{
	outval = length(v);
	outvec = normalize(v);
}

void vec_math_negate(vec3 v, out vec3 outv)
{
	outv = -v;
}

void normal(vec3 dir, vec3 nor, out vec3 outnor, out float outdot)
{
	outnor = dir;
	outdot = -dot(dir, nor);
}

void curves_vec(vec3 vec, sampler1D curvemap, out vec3 outvec)
{
	outvec.x = texture1D(curvemap, (vec.x + 1.0)*0.5).x;
	outvec.y = texture1D(curvemap, (vec.y + 1.0)*0.5).y;
	outvec.z = texture1D(curvemap, (vec.z + 1.0)*0.5).z;
}

void curves_rgb(vec4 col, sampler1D curvemap, out vec4 outcol)
{
	outcol.r = texture1D(curvemap, texture1D(curvemap, col.r).a).r;
	outcol.g = texture1D(curvemap, texture1D(curvemap, col.g).a).g;
	outcol.b = texture1D(curvemap, texture1D(curvemap, col.b).a).b;
	outcol.a = col.a;
}

void set_value(float val, out float outval)
{
	outval = val;
}

void set_rgb(vec3 col, out vec3 outcol)
{
	outcol = col;
}

void set_rgba(vec4 col, out vec4 outcol)
{
	outcol = col;
}

void set_value_zero(out float outval)
{
	outval = 0.0;
}

void set_value_one(out float outval)
{
	outval = 1.0;
}

void set_rgb_zero(out vec3 outval)
{
	outval = vec3(0.0);
}

void set_rgba_zero(out vec4 outval)
{
	outval = vec4(0.0);
}

void mix_blend(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol = mix(col1, col2, fac);
	outcol.a = col1.a;
}

void mix_add(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol = mix(col1, col1 + col2, fac);
	outcol.a = col1.a;
}

void mix_mult(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol = mix(col1, col1 * col2, fac);
	outcol.a = col1.a;
}

void mix_screen(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float facm = 1.0 - fac;

	outcol = vec4(1.0) - (vec4(facm) + fac*(vec4(1.0) - col2))*(vec4(1.0) - col1);
	outcol.a = col1.a;
}

void mix_overlay(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float facm = 1.0 - fac;

	outcol = col1;

	if(outcol.r < 0.5)
		outcol.r *= facm + 2.0*fac*col2.r;
	else
		outcol.r = 1.0 - (facm + 2.0*fac*(1.0 - col2.r))*(1.0 - outcol.r);

	if(outcol.g < 0.5)
		outcol.g *= facm + 2.0*fac*col2.g;
	else
		outcol.g = 1.0 - (facm + 2.0*fac*(1.0 - col2.g))*(1.0 - outcol.g);

	if(outcol.b < 0.5)
		outcol.b *= facm + 2.0*fac*col2.b;
	else
		outcol.b = 1.0 - (facm + 2.0*fac*(1.0 - col2.b))*(1.0 - outcol.b);
}

void mix_sub(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol = mix(col1, col1 - col2, fac);
	outcol.a = col1.a;
}

void mix_div(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float facm = 1.0 - fac;

	outcol = col1;

	if(col2.r != 0.0) outcol.r = facm*outcol.r + fac*outcol.r/col2.r;
	if(col2.g != 0.0) outcol.g = facm*outcol.g + fac*outcol.g/col2.g;
	if(col2.b != 0.0) outcol.b = facm*outcol.b + fac*outcol.b/col2.b;
}

void mix_diff(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol = mix(col1, abs(col1 - col2), fac);
	outcol.a = col1.a;
}

void mix_dark(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol.rgb = min(col1.rgb, col2.rgb*fac);
	outcol.a = col1.a;
}

void mix_light(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol.rgb = max(col1.rgb, col2.rgb*fac);
	outcol.a = col1.a;
}

void mix_dodge(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	outcol = col1;

	if(outcol.r != 0.0) {
		float tmp = 1.0 - fac*col2.r;
		if(tmp <= 0.0)
			outcol.r = 1.0;
		else if((tmp = outcol.r/tmp) > 1.0)
			outcol.r = 1.0;
		else
			outcol.r = tmp;
	}
	if(outcol.g != 0.0) {
		float tmp = 1.0 - fac*col2.g;
		if(tmp <= 0.0)
			outcol.g = 1.0;
		else if((tmp = outcol.g/tmp) > 1.0)
			outcol.g = 1.0;
		else
			outcol.g = tmp;
	}
	if(outcol.b != 0.0) {
		float tmp = 1.0 - fac*col2.b;
		if(tmp <= 0.0)
			outcol.b = 1.0;
		else if((tmp = outcol.b/tmp) > 1.0)
			outcol.b = 1.0;
		else
			outcol.b = tmp;
	}
}

void mix_burn(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float tmp, facm = 1.0 - fac;

	outcol = col1;

	tmp = facm + fac*col2.r;
	if(tmp <= 0.0)
		outcol.r = 0.0;
	else if((tmp = (1.0 - (1.0 - outcol.r)/tmp)) < 0.0)
		outcol.r = 0.0;
	else if(tmp > 1.0)
		outcol.r = 1.0;
	else
		outcol.r = tmp;

	tmp = facm + fac*col2.g;
	if(tmp <= 0.0)
		outcol.g = 0.0;
	else if((tmp = (1.0 - (1.0 - outcol.g)/tmp)) < 0.0)
		outcol.g = 0.0;
	else if(tmp > 1.0)
		outcol.g = 1.0;
	else
		outcol.g = tmp;

	tmp = facm + fac*col2.b;
	if(tmp <= 0.0)
		outcol.b = 0.0;
	else if((tmp = (1.0 - (1.0 - outcol.b)/tmp)) < 0.0)
		outcol.b = 0.0;
	else if(tmp > 1.0)
		outcol.b = 1.0;
	else
		outcol.b = tmp;
}

void mix_hue(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float facm = 1.0 - fac;

	outcol = col1;

	vec4 hsv, hsv2, tmp;
	rgb_to_hsv(col2, hsv2);

	if(hsv2.y != 0.0) {
		rgb_to_hsv(outcol, hsv);
		hsv.x = hsv2.x;
		hsv_to_rgb(hsv, tmp); 

		outcol = mix(outcol, tmp, fac);
		outcol.a = col1.a;
	}
}

void mix_sat(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float facm = 1.0 - fac;

	outcol = col1;

	vec4 hsv, hsv2;
	rgb_to_hsv(outcol, hsv);

	if(hsv.y != 0.0) {
		rgb_to_hsv(col2, hsv2);

		hsv.y = facm*hsv.y + fac*hsv2.y;
		hsv_to_rgb(hsv, outcol);
	}
}

void mix_val(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float facm = 1.0 - fac;

	vec4 hsv, hsv2;
	rgb_to_hsv(col1, hsv);
	rgb_to_hsv(col2, hsv2);

	hsv.z = facm*hsv.z + fac*hsv2.z;
	hsv_to_rgb(hsv, outcol);
}

void mix_color(float fac, vec4 col1, vec4 col2, out vec4 outcol)
{
	fac = clamp(fac, 0.0, 1.0);
	float facm = 1.0 - fac;

	outcol = col1;

	vec4 hsv, hsv2, tmp;
	rgb_to_hsv(col2, hsv2);

	if(hsv2.y != 0.0) {
		rgb_to_hsv(outcol, hsv);
		hsv.x = hsv2.x;
		hsv.y = hsv2.y;
		hsv_to_rgb(hsv, tmp); 

		outcol = mix(outcol, tmp, fac);
		outcol.a = col1.a;
	}
}

void valtorgb(float fac, sampler1D colormap, out vec4 outcol, out float outalpha)
{
	outcol = texture1D(colormap, fac);
	outalpha = outcol.a;
}

void rgbtobw(vec4 color, out float outval)
{
	outval = color.r*0.35 + color.g*0.45 + color.b*0.2;
}

void invert(float fac, vec4 col, out vec4 outcol)
{
	outcol.xyz = mix(col.xyz, vec3(1.0, 1.0, 1.0) - col.xyz, fac);
	outcol.w = col.w;
}

void hue_sat(float hue, float sat, float value, float fac, vec4 col, out vec4 outcol)
{
	vec4 hsv;

	rgb_to_hsv(col, hsv);

	hsv[0] += (hue - 0.5);
	if(hsv[0]>1.0) hsv[0]-=1.0; else if(hsv[0]<0.0) hsv[0]+= 1.0;
	hsv[1] *= sat;
	if(hsv[1]>1.0) hsv[1]= 1.0; else if(hsv[1]<0.0) hsv[1]= 0.0;
	hsv[2] *= value;
	if(hsv[2]>1.0) hsv[2]= 1.0; else if(hsv[2]<0.0) hsv[2]= 0.0;

	hsv_to_rgb(hsv, outcol);

	outcol = mix(col, outcol, fac);
}

void separate_rgb(vec4 col, out float r, out float g, out float b)
{
	r = col.r;
	g = col.g;
	b = col.b;
}

void combine_rgb(float r, float g, float b, out vec4 col)
{
	col = vec4(r, g, b, 1.0);
}

void output_node(vec4 rgb, float alpha, out vec4 outrgb)
{
	outrgb = vec4(rgb.rgb, alpha);
}

/*********** TEXTURES ***************/

void texture_flip_blend(vec3 vec, out vec3 outvec)
{
	outvec = vec.yxz;
}

void texture_blend_lin(vec3 vec, out float outval)
{
	outval = (1.0+vec.x)/2.0;
}

void texture_blend_quad(vec3 vec, out float outval)
{
	outval = max((1.0+vec.x)/2.0, 0.0);
	outval *= outval;
}

void texture_wood_sin(vec3 vec, out float value, out vec4 color, out vec3 normal)
{
	float a = sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z)*20.0;
	float wi = 0.5 + 0.5*sin(a);

	value = wi;
	color = vec4(wi, wi, wi, 1.0);
	normal = vec3(0.0, 0.0, 0.0);
}

void texture_image(vec3 vec, sampler2D ima, out float value, out vec4 color, out vec3 normal)
{
	color = texture2D(ima, (vec.xy + vec2(1.0, 1.0))*0.5);
	value = 1.0;

	normal.x = 2.0*(color.r - 0.5);
	normal.y = 2.0*(0.5 - color.g);
	normal.z = 2.0*(color.b - 0.5);
}

/************* MTEX *****************/

void texco_orco(vec3 attorco, out vec3 orco)
{
	orco = attorco;
}

void texco_uv(vec2 attuv, out vec3 uv)
{
	/* disabled for now, works together with leaving out mtex_2d_mapping
	   uv = vec3(attuv*2.0 - vec2(1.0, 1.0), 0.0); */
	uv = vec3(attuv, 0.0);
}

void texco_norm(vec3 normal, out vec3 outnormal)
{
	/* corresponds to shi->orn, which is negated so cancels
	   out blender normal negation */
	outnormal = normalize(normal);
}

void texco_tangent(vec3 tangent, out vec3 outtangent)
{
	outtangent = normalize(tangent);
}

void texco_global(mat4 viewinvmat, vec3 co, out vec3 global)
{
	global = (viewinvmat*vec4(co, 1.0)).xyz;
}

void texco_object(mat4 viewinvmat, mat4 obinvmat, vec3 co, out vec3 object)
{
	object = (obinvmat*(viewinvmat*vec4(co, 1.0))).xyz;
}

void texco_refl(vec3 vn, vec3 view, out vec3 ref)
{
	ref = view - 2.0*dot(vn, view)*vn;
}

void shade_norm(vec3 normal, out vec3 outnormal)
{
	/* blender render normal is negated */
	outnormal = -normalize(normal);
}

void mtex_rgb_blend(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm;

	fact *= facg;
	facm = 1.0-fact;

	incol = fact*texcol + facm*outcol;
}

void mtex_rgb_mul(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm;

	fact *= facg;
	facm = 1.0-facg;

	incol = (facm + fact*texcol)*outcol;
}

void mtex_rgb_screen(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm;

	fact *= facg;
	facm = 1.0-facg;

	incol = vec3(1.0) - (vec3(facm) + fact*(vec3(1.0) - texcol))*(vec3(1.0) - outcol);
}

void mtex_rgb_overlay(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm;

	fact *= facg;
	facm = 1.0-facg;

	if(outcol.r < 0.5)
		incol.r = outcol.r*(facm + 2.0*fact*texcol.r);
	else
		incol.r = 1.0 - (facm + 2.0*fact*(1.0 - texcol.r))*(1.0 - outcol.r);

	if(outcol.g < 0.5)
		incol.g = outcol.g*(facm + 2.0*fact*texcol.g);
	else
		incol.g = 1.0 - (facm + 2.0*fact*(1.0 - texcol.g))*(1.0 - outcol.g);

	if(outcol.b < 0.5)
		incol.b = outcol.b*(facm + 2.0*fact*texcol.b);
	else
		incol.b = 1.0 - (facm + 2.0*fact*(1.0 - texcol.b))*(1.0 - outcol.b);
}

void mtex_rgb_sub(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	incol = -fact*facg*texcol + outcol;
}

void mtex_rgb_add(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	incol = fact*facg*texcol + outcol;
}

void mtex_rgb_div(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm;

	fact *= facg;
	facm = 1.0-fact;

	if(texcol.r != 0.0) incol.r = facm*outcol.r + fact*outcol.r/texcol.r;
	if(texcol.g != 0.0) incol.g = facm*outcol.g + fact*outcol.g/texcol.g;
	if(texcol.b != 0.0) incol.b = facm*outcol.b + fact*outcol.b/texcol.b;
}

void mtex_rgb_diff(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm;

	fact *= facg;
	facm = 1.0-fact;

	incol = facm*outcol + fact*abs(texcol - outcol);
}

void mtex_rgb_dark(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm, col;

	fact *= facg;
	facm = 1.0-fact;

	col = fact*texcol.r;
	if(col < outcol.r) incol.r = col; else incol.r = outcol.r;
	col = fact*texcol.g;
	if(col < outcol.g) incol.g = col; else incol.g = outcol.g;
	col = fact*texcol.b;
	if(col < outcol.b) incol.b = col; else incol.b = outcol.b;
}

void mtex_rgb_light(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	float facm, col;

	fact *= facg;
	facm = 1.0-fact;

	col = fact*texcol.r;
	if(col > outcol.r) incol.r = col; else incol.r = outcol.r;
	col = fact*texcol.g;
	if(col > outcol.g) incol.g = col; else incol.g = outcol.g;
	col = fact*texcol.b;
	if(col > outcol.b) incol.b = col; else incol.b = outcol.b;
}

void mtex_rgb_hue(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	vec4 col;

	mix_hue(fact*facg, vec4(outcol, 1.0), vec4(texcol, 1.0), col);
	incol.rgb = col.rgb;
}

void mtex_rgb_sat(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	vec4 col;

	mix_sat(fact*facg, vec4(outcol, 1.0), vec4(texcol, 1.0), col);
	incol.rgb = col.rgb;
}

void mtex_rgb_val(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	vec4 col;

	mix_val(fact*facg, vec4(outcol, 1.0), vec4(texcol, 1.0), col);
	incol.rgb = col.rgb;
}

void mtex_rgb_color(vec3 outcol, vec3 texcol, float fact, float facg, out vec3 incol)
{
	vec4 col;

	mix_color(fact*facg, vec4(outcol, 1.0), vec4(texcol, 1.0), col);
	incol.rgb = col.rgb;
}

void mtex_value_vars(inout float fact, float facg, out float facm, float flip)
{
	fact *= facg;
	facm = 1.0-fact;

	if(flip != 0.0) {
		float tmp = fact;
		fact = facm;
		facm = tmp;
	}
}

void mtex_value_blend(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	incol = fact*texcol + facm*outcol;
}

void mtex_value_mul(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	facm = 1.0 - facg;
	incol = (facm + fact*texcol)*outcol;
}

void mtex_value_screen(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	facm = 1.0 - facg;
	incol = 1.0 - (facm + fact*(1.0 - texcol))*(1.0 - outcol);
}

void mtex_value_sub(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	fact = -fact;
	incol = fact*texcol + outcol;
}

void mtex_value_add(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	fact = fact;
	incol = fact*texcol + outcol;
}

void mtex_value_div(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	if(texcol != 0.0)
		incol = facm*outcol + fact*outcol/texcol;
	else
		incol = 0.0;
}

void mtex_value_diff(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	incol = facm*outcol + fact*abs(texcol - outcol);
}

void mtex_value_dark(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	float col = fact*texcol;
	if(col < outcol) incol = col; else incol = outcol;
}

void mtex_value_light(float outcol, float texcol, float fact, float facg, float flip, out float incol)
{
	float facm;
	mtex_value_vars(fact, facg, facm, flip);

	float col = fact*texcol;
	if(col > outcol) incol = col; else incol = outcol;
}

void mtex_value_clamp_positive(float fac, out float outfac)
{
	outfac = max(fac, 0.0);
}

void mtex_value_clamp(float fac, out float outfac)
{
	outfac = clamp(fac, 0.0, 1.0);
}

void mtex_har_divide(float har, out float outhar)
{
	outhar = har/128.0;
}

void mtex_har_multiply_clamp(float har, out float outhar)
{
	har *= 128.0;

	if(har < 1.0) outhar = 1.0;
	else if(har > 511.0) outhar = 511.0;
	else outhar = har;
}

void mtex_alpha_from_col(vec4 col, out float alpha)
{
	alpha = col.a;
}

void mtex_alpha_to_col(vec4 col, float alpha, out vec4 outcol)
{
	outcol = vec4(col.rgb, alpha);
}

void mtex_rgbtoint(vec4 rgb, out float intensity)
{
	intensity = dot(vec3(0.35, 0.45, 0.2), rgb.rgb);
}

void mtex_value_invert(float invalue, out float outvalue)
{
	outvalue = 1.0 - invalue;
}

void mtex_rgb_invert(vec4 inrgb, out vec4 outrgb)
{
	outrgb = vec4(vec3(1.0) - inrgb.rgb, inrgb.a);
}

void mtex_value_stencil(float stencil, float intensity, out float outstencil, out float outintensity)
{
	float fact = intensity;
	outintensity = intensity*stencil;
	outstencil = stencil*fact;
}

void mtex_rgb_stencil(float stencil, vec4 rgb, out float outstencil, out vec4 outrgb)
{
	float fact = rgb.a;
	outrgb = vec4(rgb.rgb, rgb.a*stencil);
	outstencil = stencil*fact;
}

void mtex_mapping_ofs(vec3 texco, vec3 ofs, out vec3 outtexco)
{
	outtexco = texco + ofs;
}

void mtex_mapping_size(vec3 texco, vec3 size, out vec3 outtexco)
{
	outtexco = size*texco;
}

void mtex_2d_mapping(vec3 vec, out vec3 outvec)
{
	outvec = vec3(vec.xy*0.5 + vec2(0.5, 0.5), vec.z);
}

void mtex_image(vec3 vec, sampler2D ima, out float value, out vec4 color, out vec3 normal)
{
	color = texture2D(ima, vec.xy);
	value = 1.0;
	
	normal = 2.0*(vec3(color.r, -color.g, color.b) - vec3(0.5, -0.5, 0.5));
}

void mtex_negate_texnormal(vec3 normal, out vec3 outnormal)
{
	outnormal = vec3(-normal.x, -normal.y, normal.z);
}

void mtex_nspace_tangent(vec3 tangent, vec3 normal, vec3 texnormal, out vec3 outnormal)
{
	tangent = normalize(tangent);
	vec3 B = cross(normal, tangent);

	outnormal = texnormal.x*tangent + texnormal.y*B + texnormal.z*normal;
	outnormal = normalize(outnormal);
}

void mtex_blend_normal(float norfac, vec3 normal, vec3 newnormal, out vec3 outnormal)
{
	outnormal = (1.0 - norfac)*normal + norfac*newnormal;
	outnormal = normalize(outnormal);
}

/******* MATERIAL *********/

void lamp_visibility_sun_hemi(vec3 lampvec, out vec3 lv, out float dist, out float visifac)
{
	lv = lampvec;
	dist = 1.0;
	visifac = 1.0;
}

void lamp_visibility_other(vec3 co, vec3 lampco, out vec3 lv, out float dist, out float visifac)
{
	lv = co - lampco;
	dist = length(lv);
	lv = normalize(lv);
	visifac = 1.0;
}

void lamp_falloff_invlinear(float lampdist, float dist, out float visifac)
{
	visifac = lampdist/(lampdist + dist);
}

void lamp_falloff_invsquare(float lampdist, float dist, out float visifac)
{
	visifac = lampdist/(lampdist + dist*dist);
}

void lamp_falloff_sliders(float lampdist, float ld1, float ld2, float dist, out float visifac)
{
	float lampdistkw = lampdist*lampdist;

	visifac = lampdist/(lampdist + ld1*dist);
	visifac *= lampdistkw/(lampdistkw + ld2*dist*dist);
}

void lamp_falloff_curve(float lampdist, sampler1D curvemap, float dist, out float visifac)
{
	visifac = texture1D(curvemap, dist/lampdist).x;
}

void lamp_visibility_sphere(float lampdist, float dist, float visifac, out float outvisifac)
{
	float t= lampdist - dist;

	outvisifac= visifac*max(t, 0.0)/lampdist;
}

void lamp_visibility_spot_square(vec3 lampvec, mat4 lampimat, vec3 lv, out float inpr)
{
	if(dot(lv, lampvec) > 0.0) {
		vec3 lvrot = (lampimat*vec4(lv, 0.0)).xyz;
		float x = max(abs(lvrot.x/lvrot.z), abs(lvrot.y/lvrot.z));

		inpr = 1.0/sqrt(1.0 + x*x);
	}
	else
		inpr = 0.0;
}

void lamp_visibility_spot_circle(vec3 lampvec, vec3 lv, out float inpr)
{
	inpr = dot(lv, lampvec);
}

void lamp_visibility_spot(float spotsi, float spotbl, float inpr, float visifac, out float outvisifac)
{
	float t = spotsi;

	if(inpr <= t) {
		outvisifac = 0.0;
	}
	else {
		t = inpr - t;

		/* soft area */
		if(spotbl != 0.0)
			inpr *= smoothstep(0.0, 1.0, t/spotbl);

		outvisifac = visifac*inpr;
	}
}

void lamp_visibility_clamp(float visifac, out float outvisifac)
{
	outvisifac = (visifac < 0.001)? 0.0: visifac;
}

void shade_view(vec3 co, out vec3 view)
{
	/* handle perspective/orthographic */
	view = (gl_ProjectionMatrix[3][3] == 0.0)? normalize(co): vec3(0.0, 0.0, -1.0);
}

void shade_tangent_v(vec3 lv, vec3 tang, out vec3 vn)
{
	vec3 c = cross(lv, tang);
	vec3 vnor = cross(c, tang);

	vn = -normalize(vnor);
}

void shade_inp(vec3 vn, vec3 lv, out float inp)
{
	inp = dot(vn, lv);
}

void shade_is_no_diffuse(out float is)
{
	is = 0.0;
}

void shade_is_hemi(float inp, out float is)
{
	is = 0.5*inp + 0.5;
}

float area_lamp_energy(mat4 area, vec3 co, vec3 vn)
{
	vec3 vec[4], c[4];
	float rad[4], fac;
	
	vec[0] = normalize(co - area[0].xyz);
	vec[1] = normalize(co - area[1].xyz);
	vec[2] = normalize(co - area[2].xyz);
	vec[3] = normalize(co - area[3].xyz);

	c[0] = normalize(cross(vec[0], vec[1]));
	c[1] = normalize(cross(vec[1], vec[2]));
	c[2] = normalize(cross(vec[2], vec[3]));
	c[3] = normalize(cross(vec[3], vec[0]));

	rad[0] = acos(dot(vec[0], vec[1]));
	rad[1] = acos(dot(vec[1], vec[2]));
	rad[2] = acos(dot(vec[2], vec[3]));
	rad[3] = acos(dot(vec[3], vec[0]));

	fac=  rad[0]*dot(vn, c[0]);
	fac+= rad[1]*dot(vn, c[1]);
	fac+= rad[2]*dot(vn, c[2]);
	fac+= rad[3]*dot(vn, c[3]);

	return max(fac, 0.0);
}

void shade_inp_area(vec3 position, vec3 lampco, vec3 lampvec, vec3 vn, mat4 area, float areasize, float k, out float inp)
{
	vec3 co = position;
	vec3 vec = co - lampco;

	if(dot(vec, lampvec) < 0.0) {
		inp = 0.0;
	}
	else {
		float intens = area_lamp_energy(area, co, vn);

		inp = pow(intens*areasize, k);
	}
}

void shade_diffuse_oren_nayer(float nl, vec3 n, vec3 l, vec3 v, float rough, out float is)
{
	vec3 h = normalize(v + l);
	float nh = max(dot(n, h), 0.0);
	float nv = max(dot(n, v), 0.0);
	float realnl = dot(n, l);

	if(realnl < 0.0) {
		is = 0.0;
	}
	else if(nl < 0.0) {
		is = 0.0;
	}
	else {
		float vh = max(dot(v, h), 0.0);
		float Lit_A = acos(realnl);
		float View_A = acos(nv);

		vec3 Lit_B = normalize(l - realnl*n);
		vec3 View_B = normalize(v - nv*n);

		float t = max(dot(Lit_B, View_B), 0.0);

		float a, b;

		if(Lit_A > View_A) {
			a = Lit_A;
			b = View_A;
		}
		else {
			a = View_A;
			b = Lit_A;
		}

		float A = 1.0 - (0.5*((rough*rough)/((rough*rough) + 0.33)));
		float B = 0.45*((rough*rough)/((rough*rough) + 0.09));

		b *= 0.95;
		is = nl*(A + (B * t * sin(a) * tan(b)));
	}
}

void shade_diffuse_toon(vec3 n, vec3 l, vec3 v, float size, float tsmooth, out float is)
{
	float rslt = dot(n, l);
	float ang = acos(rslt);

	if(ang < size) is = 1.0;
	else if(ang > (size + tsmooth) || tsmooth == 0.0) is = 0.0;
	else is = 1.0 - ((ang - size)/tsmooth);
}

void shade_diffuse_minnaert(float nl, vec3 n, vec3 v, float darkness, out float is)
{
	if(nl <= 0.0) {
		is = 0.0;
	}
	else {
		float nv = max(dot(n, v), 0.0);

		if(darkness <= 1.0)
			is = nl*pow(max(nv*nl, 0.1), darkness - 1.0);
		else
			is = nl*pow(1.0001 - nv, darkness - 1.0);
	}
}

float fresnel_fac(vec3 view, vec3 vn, float grad, float fac)
{
	float t1, t2;
	float ffac;

	if(fac==0.0) {
		ffac = 1.0;
	}
	else {
		t1= dot(view, vn);
		if(t1>0.0)  t2= 1.0+t1;
		else t2= 1.0-t1;

		t2= grad + (1.0-grad)*pow(t2, fac);

		if(t2<0.0) ffac = 0.0;
		else if(t2>1.0) ffac = 1.0;
		else ffac = t2;
	}

	return ffac;
}

void shade_diffuse_fresnel(vec3 vn, vec3 lv, vec3 view, float fac_i, float fac, out float is)
{
	is = fresnel_fac(lv, vn, fac_i, fac);
}

void shade_cubic(float is, out float outis)
{
	if(is>0.0 && is<1.0)
		outis= smoothstep(0.0, 1.0, is);
	else
		outis= is;
}

void shade_visifac(float i, float visifac, float refl, out float outi)
{
	/*if(i > 0.0)*/
		outi = max(i*visifac*refl, 0.0);
	/*else
		outi = i;*/
}

void shade_tangent_v_spec(vec3 tang, out vec3 vn)
{
	vn = tang;
}

void shade_add_to_diffuse(float i, vec3 lampcol, vec3 col, out vec3 outcol)
{
	if(i > 0.0)
		outcol = i*lampcol*col;
	else
		outcol = vec3(0.0, 0.0, 0.0);
}

void shade_hemi_spec(vec3 vn, vec3 lv, vec3 view, float spec, float hard, float visifac, out float t)
{
	lv += view;
	lv = normalize(lv);

	t = dot(vn, lv);
	t = 0.5*t + 0.5;

	t = visifac*spec*pow(t, hard);
}

void shade_phong_spec(vec3 n, vec3 l, vec3 v, float hard, out float specfac)
{
	vec3 h = normalize(l + v);
	float rslt = max(dot(h, n), 0.0);

	specfac = pow(rslt, hard);
}

void shade_cooktorr_spec(vec3 n, vec3 l, vec3 v, float hard, out float specfac)
{
	vec3 h = normalize(v + l);
	float nh = dot(n, h);

	if(nh < 0.0) {
		specfac = 0.0;
	}
	else {
		float nv = max(dot(n, v), 0.0);
		float i = pow(nh, hard);

		i = i/(0.1+nv);
		specfac = i;
	}
}

void shade_blinn_spec(vec3 n, vec3 l, vec3 v, float refrac, float spec_power, out float specfac)
{
	if(refrac < 1.0) {
		specfac = 0.0;
	}
	else if(spec_power == 0.0) {
		specfac = 0.0;
	}
	else {
		if(spec_power<100.0)
			spec_power= sqrt(1.0/spec_power);
		else
			spec_power= 10.0/spec_power;

		vec3 h = normalize(v + l);
		float nh = dot(n, h);
		if(nh < 0.0) {
			specfac = 0.0;
		}
		else {
			float nv = max(dot(n, v), 0.01);
			float nl = dot(n, l);
			if(nl <= 0.01) {
				specfac = 0.0;
			}
			else {
				float vh = max(dot(v, h), 0.01);

				float a = 1.0;
				float b = (2.0*nh*nv)/vh;
				float c = (2.0*nh*nl)/vh;

				float g = 0.0;

				if(a < b && a < c) g = a;
				else if(b < a && b < c) g = b;
				else if(c < a && c < b) g = c;

				float p = sqrt(((refrac * refrac)+(vh*vh)-1.0));
				float f = (((p-vh)*(p-vh))/((p+vh)*(p+vh)))*(1.0+((((vh*(p+vh))-1.0)*((vh*(p+vh))-1.0))/(((vh*(p-vh))+1.0)*((vh*(p-vh))+1.0))));
				float ang = acos(nh);

				specfac = max(f*g*exp_blender((-(ang*ang)/(2.0*spec_power*spec_power))), 0.0);
			}
		}
	}
}

void shade_wardiso_spec(vec3 n, vec3 l, vec3 v, float rms, out float specfac)
{
	vec3 h = normalize(l + v);
	float nh = max(dot(n, h), 0.001);
	float nv = max(dot(n, v), 0.001);
	float nl = max(dot(n, l), 0.001);
	float angle = tan(acos(nh));
	float alpha = max(rms, 0.001);

	specfac= nl * (1.0/(4.0*M_PI*alpha*alpha))*(exp_blender(-(angle*angle)/(alpha*alpha))/(sqrt(nv*nl)));
}

void shade_toon_spec(vec3 n, vec3 l, vec3 v, float size, float tsmooth, out float specfac)
{
	vec3 h = normalize(l + v);
	float rslt = dot(h, n);
	float ang = acos(rslt);

	if(ang < size) rslt = 1.0;
	else if(ang >= (size + tsmooth) || tsmooth == 0.0) rslt = 0.0;
	else rslt = 1.0 - ((ang - size)/tsmooth);

	specfac = rslt;
}

void shade_spec_area_inp(float specfac, float inp, out float outspecfac)
{
	outspecfac = specfac*inp;
}

void shade_spec_t(float shadfac, float spec, float visifac, float specfac, out float t)
{
	t = shadfac*spec*visifac*specfac;
}

void shade_add_spec(float t, vec3 lampcol, vec3 speccol, out vec3 outcol)
{
	outcol = t*lampcol*speccol;
}

void shade_add(vec4 col1, vec4 col2, out vec4 outcol)
{
	outcol = col1 + col2;
}

void shade_madd(vec4 col, vec4 col1, vec4 col2, out vec4 outcol)
{
	outcol = col + col1*col2;
}

void shade_maddf(vec4 col, float f, vec4 col1, out vec4 outcol)
{
	outcol = col + f*col1;
}

void shade_mul(vec4 col1, vec4 col2, out vec4 outcol)
{
	outcol = col1*col2;
}

void shade_mul_value(float fac, vec4 col, out vec4 outcol)
{
	outcol = col*fac;
}

void shade_obcolor(vec4 col, vec4 obcol, out vec4 outcol)
{
	outcol = vec4(col.rgb*obcol.rgb, col.a);
}

void ramp_rgbtobw(vec3 color, out float outval)
{
	outval = color.r*0.3 + color.g*0.58 + color.b*0.12;
}

void shade_only_shadow(float i, float shadfac, float energy, out float outshadfac)
{
	outshadfac = i*energy*(1.0 - shadfac);
}

void shade_only_shadow_diffuse(float shadfac, vec3 rgb, vec4 diff, out vec4 outdiff)
{
	outdiff = diff - vec4(rgb*shadfac, 0.0);
}

void shade_only_shadow_specular(float shadfac, vec3 specrgb, vec4 spec, out vec4 outspec)
{
	outspec = spec - vec4(specrgb*shadfac, 0.0);
}

void test_shadowbuf(vec3 rco, sampler2DShadow shadowmap, mat4 shadowpersmat, float shadowbias, float inp, out float result)
{
	if(inp <= 0.0) {
		result = 0.0;
	}
	else {
		vec4 co = shadowpersmat*vec4(rco, 1.0);

		//float bias = (1.5 - inp*inp)*shadowbias;
		co.z -= shadowbias*co.w;

		result = shadow2DProj(shadowmap, co).x;
	}
}

void shade_exposure_correct(vec3 col, float linfac, float logfac, out vec3 outcol)
{
	outcol = linfac*(1.0 - exp(col*logfac));
}

void shade_mist_factor(vec3 co, float miststa, float mistdist, float misttype, float misi, out float outfac)
{
	float fac, zcor;

	zcor = (gl_ProjectionMatrix[3][3] == 0.0)? length(co): -co[2];
	
	fac = clamp((zcor-miststa)/mistdist, 0.0, 1.0);
	if(misttype == 0.0) fac *= fac;
	else if(misttype == 1.0);
	else fac = sqrt(fac);

	outfac = 1.0 - (1.0-fac)*(1.0-misi);
}

void shade_world_mix(vec3 hor, vec4 col, out vec4 outcol)
{
	float fac = clamp(col.a, 0.0, 1.0);
	outcol = vec4(mix(hor, col.rgb, fac), col.a);
}

void shade_alpha_opaque(vec4 col, out vec4 outcol)
{
	outcol = vec4(col.rgb, 1.0);
}

void shade_alpha_obcolor(vec4 col, vec4 obcol, out vec4 outcol)
{
	outcol = vec4(col.rgb, col.a*obcol.a);
}

varying vec3 varnormal;
varying vec3 varposition;
varying vec2 var0;
uniform sampler2D samp0;
const vec3 cons15 = vec3(0.701961, 0.466667, 0.290196);
const float cons18 = float(1.000000);
uniform sampler2D samp1;
const float cons29 = float(0.000000);
const float cons30 = float(1.000000);
const float cons32 = float(1.000000);
const float cons33 = float(0.000000);
uniform sampler2D samp2;
varying vec3 var1;
const vec3 cons64 = vec3(0.600000, 0.800000, 1.000000);
const vec3 cons67 = vec3(0.200000, -0.100000, 0.000000);
uniform sampler2D samp3;
const float cons78 = float(0.500000);
const float cons79 = float(1.000000);
const vec3 cons82 = vec3(0.431607, 0.455515, 0.273309);
const vec3 cons89 = vec3(0.800000, 0.300000, 0.000000);
const vec3 cons92 = vec3(0.250000, 0.350000, 0.000000);
const vec3 cons104 = vec3(0.234322, 0.352367, 0.575655);
const float cons106 = float(1.000000);
const float cons108 = float(0.200000);
uniform vec3 unf112;
const float cons125 = float(0.698034);
uniform vec4 unf128;
uniform sampler1D samp4;
const float cons141 = float(1.000000);
const float cons154 = float(0.000000);
const float cons155 = float(100.000000);
uniform vec3 unf159;
const vec3 cons160 = vec3(1.000000, 1.000000, 1.000000);
uniform vec3 unf165;
const float cons176 = float(0.698034);
uniform vec4 unf179;
uniform sampler1D samp5;
const float cons192 = float(1.000000);
const float cons205 = float(100.000000);
const float cons207 = float(1.000000);
uniform vec3 unf213;
const vec3 cons214 = vec3(1.000000, 1.000000, 1.000000);
uniform vec3 unf220;
const float cons224 = float(20.000000);
uniform vec3 unf227;
const float cons230 = float(0.996195);
const float cons231 = float(0.000571);
const float cons244 = float(0.698034);
uniform sampler2DShadow samp6;
uniform mat4 unf248;
const float cons249 = float(0.005000);
uniform float unf254;
uniform vec3 unf261;
const float cons265 = float(20.000000);
uniform vec3 unf268;
const float cons271 = float(0.996195);
const float cons272 = float(0.000571);
const float cons285 = float(0.698034);
uniform sampler2DShadow samp7;
uniform mat4 unf289;
const float cons290 = float(0.005000);
uniform float unf295;
const float cons305 = float(1.000000);
uniform vec4 unfobcolor;
const float cons311 = float(6.000000);
const float cons312 = float(26.000000);
const float cons313 = float(0.000000);
const float cons314 = float(0.000000);
const vec4 cons318 = vec4(0.906274, 0.882745, 0.992157, 0.000000);

void main(void)
{
	vec3 tmp2;
	vec3 tmp4;
	vec3 tmp6;
	float tmp9;
	vec4 tmp10;
	vec3 tmp11;
	vec4 tmp13;
	float tmp14;
	vec3 tmp19;
	vec3 tmp21;
	float tmp24;
	vec4 tmp25;
	vec3 tmp26;
	float tmp28;
	float tmp34;
	float tmp36;
	vec3 tmp38;
	float tmp41;
	vec4 tmp42;
	vec3 tmp43;
	vec3 tmp47;
	vec3 tmp49;
	float tmp52;
	vec4 tmp53;
	vec3 tmp54;
	vec3 tmp58;
	vec3 tmp60;
	vec3 tmp62;
	vec3 tmp65;
	vec3 tmp68;
	float tmp71;
	vec4 tmp72;
	vec3 tmp73;
	float tmp75;
	float tmp77;
	float tmp80;
	vec3 tmp85;
	vec3 tmp87;
	vec3 tmp90;
	vec3 tmp93;
	float tmp96;
	vec4 tmp97;
	vec3 tmp98;
	float tmp100;
	float tmp102;
	vec3 tmp107;
	vec4 tmp110;
	vec3 tmp111;
	vec3 tmp113;
	float tmp114;
	float tmp115;
	float tmp118;
	float tmp120;
	float tmp122;
	float tmp126;
	vec4 tmp129;
	vec3 tmp132;
	float tmp133;
	vec4 tmp136;
	float tmp137;
	float tmp139;
	float tmp142;
	vec4 tmp146;
	vec4 tmp150;
	float tmp157;
	vec3 tmp161;
	vec4 tmp164;
	vec3 tmp166;
	float tmp167;
	float tmp168;
	float tmp171;
	float tmp173;
	float tmp177;
	vec4 tmp180;
	vec3 tmp183;
	float tmp184;
	vec4 tmp187;
	float tmp188;
	float tmp190;
	float tmp193;
	vec4 tmp197;
	vec4 tmp201;
	float tmp206;
	float tmp211;
	vec3 tmp215;
	vec4 tmp218;
	vec3 tmp221;
	float tmp222;
	float tmp223;
	float tmp226;
	float tmp229;
	float tmp234;
	float tmp236;
	float tmp239;
	float tmp241;
	float tmp245;
	float tmp251;
	float tmp255;
	vec4 tmp259;
	vec3 tmp262;
	float tmp263;
	float tmp264;
	float tmp267;
	float tmp270;
	float tmp275;
	float tmp277;
	float tmp280;
	float tmp282;
	float tmp286;
	float tmp292;
	float tmp296;
	vec4 tmp300;
	vec4 tmp303;
	vec4 tmp306;
	vec4 tmp309;
	float tmp315;
	vec4 tmp319;
	vec4 tmp321;
	vec4 tmp324;

	shade_norm(varnormal, tmp2);
	shade_view(varposition, tmp4);
	texco_uv(var0, tmp6);
	mtex_image(tmp6, samp0, tmp9, tmp10, tmp11);
	set_rgba(tmp10, tmp13);
	set_value_one(tmp14);
	mtex_rgb_blend(cons15, tmp13.rgb, tmp14, cons18, tmp19);
	texco_uv(var0, tmp21);
	mtex_image(tmp21, samp1, tmp24, tmp25, tmp26);
	mtex_rgbtoint(tmp25, tmp28);
	mtex_value_blend(cons29, cons30, tmp28, cons32, cons33, tmp34);
	mtex_value_clamp_positive(tmp34, tmp36);
	texco_uv(var0, tmp38);
	mtex_image(tmp38, samp2, tmp41, tmp42, tmp43);
	mtex_nspace_tangent(var1, tmp2, tmp43, tmp47);
	texco_uv(var0, tmp49);
	mtex_image(tmp49, samp2, tmp52, tmp53, tmp54);
	mtex_nspace_tangent(var1, tmp47, tmp54, tmp58);
	vec_math_negate(tmp58, tmp60);
	mtex_2d_mapping(tmp60, tmp62);
	mtex_mapping_size(tmp62, cons64, tmp65);
	mtex_mapping_ofs(tmp65, cons67, tmp68);
	mtex_image(tmp68, samp3, tmp71, tmp72, tmp73);
	mtex_rgbtoint(tmp72, tmp75);
	mtex_value_invert(tmp75, tmp77);
	math_multiply(cons78, cons79, tmp80);
	mtex_rgb_add(tmp19, cons82, tmp77, tmp80, tmp85);
	mtex_2d_mapping(tmp60, tmp87);
	mtex_mapping_size(tmp87, cons89, tmp90);
	mtex_mapping_ofs(tmp90, cons92, tmp93);
	mtex_image(tmp93, samp3, tmp96, tmp97, tmp98);
	mtex_rgbtoint(tmp97, tmp100);
	mtex_value_invert(tmp100, tmp102);
	mtex_rgb_add(tmp85, cons104, tmp102, cons106, tmp107);
	shade_mul_value(cons108, vec4(tmp107, 1.0), tmp110);
	set_rgb_zero(tmp111);
	lamp_visibility_sun_hemi(unf112, tmp113, tmp114, tmp115);
	shade_inp(tmp58, tmp113, tmp118);
	shade_is_hemi(tmp118, tmp120);
	shade_cubic(tmp120, tmp122);
	shade_visifac(tmp122, tmp115, cons125, tmp126);
	shade_mul_value(tmp126, unf128, tmp129);
	vec_math_dot(tmp4, tmp58, tmp132, tmp133);
	valtorgb(tmp133, samp4, tmp136, tmp137);
	mtex_alpha_from_col(tmp136, tmp139);
	math_multiply(tmp139, cons141, tmp142);
	mix_screen(tmp142, vec4(tmp107, 1.0), tmp136, tmp146);
	shade_madd(tmp110, tmp129, tmp146, tmp150);
	shade_hemi_spec(tmp58, tmp113, tmp4, cons154, cons155, tmp115, tmp157);
	shade_add_spec(tmp157, unf159, cons160, tmp161);
	shade_add(vec4(tmp111, 1.0), vec4(tmp161, 1.0), tmp164);
	lamp_visibility_sun_hemi(unf165, tmp166, tmp167, tmp168);
	shade_inp(tmp58, tmp166, tmp171);
	shade_cubic(tmp171, tmp173);
	shade_visifac(tmp173, tmp168, cons176, tmp177);
	shade_mul_value(tmp177, unf179, tmp180);
	vec_math_dot(tmp4, tmp58, tmp183, tmp184);
	valtorgb(tmp184, samp5, tmp187, tmp188);
	mtex_alpha_from_col(tmp187, tmp190);
	math_multiply(tmp190, cons192, tmp193);
	mix_screen(tmp193, vec4(tmp107, 1.0), tmp187, tmp197);
	shade_madd(tmp150, tmp180, tmp197, tmp201);
	shade_phong_spec(tmp58, tmp166, tmp4, cons205, tmp206);
	shade_spec_t(cons207, tmp36, tmp168, tmp206, tmp211);
	shade_add_spec(tmp211, unf213, cons214, tmp215);
	shade_add(tmp164, vec4(tmp215, 1.0), tmp218);
	lamp_visibility_other(varposition, unf220, tmp221, tmp222, tmp223);
	lamp_falloff_invlinear(cons224, tmp222, tmp226);
	lamp_visibility_spot_circle(unf227, tmp221, tmp229);
	lamp_visibility_spot(cons230, cons231, tmp229, tmp226, tmp234);
	lamp_visibility_clamp(tmp234, tmp236);
	shade_inp(tmp58, tmp221, tmp239);
	shade_cubic(tmp239, tmp241);
	shade_visifac(tmp241, tmp236, cons244, tmp245);
	test_shadowbuf(varposition, samp6, unf248, cons249, tmp239, tmp251);
	shade_only_shadow(tmp245, tmp251, unf254, tmp255);
	shade_only_shadow_diffuse(tmp255, tmp107, tmp201, tmp259);
	lamp_visibility_other(varposition, unf261, tmp262, tmp263, tmp264);
	lamp_falloff_invlinear(cons265, tmp263, tmp267);
	lamp_visibility_spot_circle(unf268, tmp262, tmp270);
	lamp_visibility_spot(cons271, cons272, tmp270, tmp267, tmp275);
	lamp_visibility_clamp(tmp275, tmp277);
	shade_inp(tmp58, tmp262, tmp280);
	shade_cubic(tmp280, tmp282);
	shade_visifac(tmp282, tmp277, cons285, tmp286);
	test_shadowbuf(varposition, samp7, unf289, cons290, tmp280, tmp292);
	shade_only_shadow(tmp286, tmp292, unf295, tmp296);
	shade_only_shadow_diffuse(tmp296, tmp107, tmp259, tmp300);
	shade_add(tmp300, tmp218, tmp303);
	mtex_alpha_to_col(tmp303, cons305, tmp306);
	shade_obcolor(tmp306, unfobcolor, tmp309);
	shade_mist_factor(varposition, cons311, cons312, cons313, cons314, tmp315);
	mix_blend(tmp315, tmp309, cons318, tmp319);
	shade_alpha_opaque(tmp319, tmp321);
	shade_alpha_obcolor(tmp321, unfobcolor, tmp324);

	gl_FragColor = tmp324;
}
