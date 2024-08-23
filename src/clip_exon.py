import json
from collections import defaultdict

def clip_sequence(sequence, clip_length=5):
    """Clip the sequence by removing `clip_length` nucleotides from each end."""
    return sequence[clip_length:-clip_length]

def clip_structure(struct, clip_length=5):
    """Clip the struct by removing `clip_length` positions from each end."""
    return struct[clip_length:-clip_length]

def filter_nucleotide_positions(children, clip_length, sequence_length):
    filtered = []
    for child in children:
        if 'children' in child:
            # Recursively filter the children's children
            child['children'] = filter_nucleotide_positions(child['children'], clip_length, sequence_length)
        
        # Process only if the name starts with 'pos_'
        if child['name'].startswith('pos_'):
            try:
                position = int(child['name'].split('_')[-1])
                if clip_length-1 < position <= (sequence_length - clip_length*2):
                    # Adjust the position and update the name
                    adjusted_position = position - clip_length
                    child['name'] = f'pos_{adjusted_position}'
                    filtered.append(child)
            except ValueError:
                # Skip this child if position is not a valid integer
                continue
        else:
            # Keep non-pos_ entries as well, or handle them as necessary
            filtered.append(child)
    
    return filtered

def adjusted_nucleotide_activations(data, sequence_length, clip_length=5):
    """Adjust the nucleotide activations after clipping."""
    data['children'] = filter_nucleotide_positions(data['children'], clip_length, sequence_length)
    return data

def adjusted_feature_activations(activations, sequence_length, clip_length=5):
    """
    Adjust the position names after clipping.
    Removes children whose positions are outside the boundaries [clip_length, sequence_length - clip_length].
    """
    def filter_positions(children, clip_length, sequence_length):
        filtered = []
        for child in children:
            if 'children' in child:
                # Recursively filter the children's children
                child['children'] = filter_positions(child['children'], clip_length, sequence_length)
            
            # Process only if the name starts with 'pos_'
            if child['name'].startswith('pos_'):
                try:
                    position = int(child['name'].split('_')[-1])
                    print(f"Processing {child['name']} with position {position}")  # Debugging line
                    if clip_length-1 < position <= (sequence_length - clip_length*2):
                        # Adjust the position and update the name
                        adjusted_position = position - clip_length
                        child['name'] = f'pos_{adjusted_position}'
                        filtered.append(child)
                    else:
                        print(f"Excluding {child['name']} with position {position}")  # Debugging line
                except ValueError:
                    # Skip this child if position is not a valid integer
                    print(f"Skipping {child['name']} due to ValueError")  # Debugging line
                    continue
            else:
                # Keep the non-pos_ entries as well, or handle them as necessary
                filtered.append(child)
        
        return filtered
    
    # Start filtering from the root level
    activations['children'] = filter_positions(activations['children'], clip_length, sequence_length)
    
    return activations




def clip_exon(data):

    data['feature_activations'] = adjusted_feature_activations(data['feature_activations'], len(data['sequence']), clip_length=5)
    data['nucleotide_activations'] = adjusted_nucleotide_activations(data['nucleotide_activations'], len(data['sequence']), clip_length=5)
    data['sequence'] = clip_sequence(data['sequence'])
    data['structs'] = clip_structure(data['structs'])
    # # data['feature_activations'] = adjusted_activations(data['feature_activations'])
    # data['nucleotide_activations'] = adjusted_nucleotide_activations(data['nucleotide_activations'])
    print(data['sequence'])
    return data
