varying vec2 source_texcoords;
uniform sampler1D source_sampler;

vec4 get_source()
{
    return texture1D (source_sampler, source_texcoords.x);
}
varying float mask_coverage;
vec4 get_mask()
{
    return vec4(0, 0, 0, mask_coverage);
}
void main()
{
    gl_FragColor = get_source() * get_mask().a;
}
