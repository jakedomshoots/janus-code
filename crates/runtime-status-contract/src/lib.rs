use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

const REQUIRED_FIELDS: &[&str] = &[
    "runtimeId",
    "rendererGraphEpoch",
    "graphStatus",
    "authoritativeWindowId",
    "liveTabCount",
    "liveLeafCount",
    "runtimeProtocolVersion",
    "minCompatibleRuntimeClientVersion",
    "capabilities",
    "hostPlatform",
];

fn repository_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .expect("runtime-status-contract crate must live under crates/")
        .to_path_buf()
}

fn load_json(relative_path: &str) -> Value {
    let path = repository_root().join(relative_path);
    let source = fs::read_to_string(&path)
        .unwrap_or_else(|error| panic!("failed to read {}: {error}", path.display()));

    serde_json::from_str(&source)
        .unwrap_or_else(|error| panic!("failed to parse {}: {error}", path.display()))
}

fn missing_runtime_status_fields(value: &Value) -> Vec<&'static str> {
    REQUIRED_FIELDS
        .iter()
        .copied()
        .filter(|field| value.get(field).is_none())
        .collect()
}

pub fn validate_runtime_status_sample(relative_path: &str) -> Result<(), Vec<&'static str>> {
    let value = load_json(relative_path);
    let missing_fields = missing_runtime_status_fields(&value);

    if missing_fields.is_empty() {
        Ok(())
    } else {
        Err(missing_fields)
    }
}

fn validation_result_json(result: Result<(), Vec<&'static str>>) -> Value {
    match result {
        Ok(()) => serde_json::json!({ "ok": true }),
        Err(missing_fields) => serde_json::json!({
            "ok": false,
            "missingFields": missing_fields,
        }),
    }
}

pub fn verify_runtime_status_artifact_required_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let required_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("requiredFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| "contract artifact must include summary.requiredFields array".to_string())?;

    let actual_fields: Result<Vec<&str>, String> = required_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field
                .as_str()
                .ok_or_else(|| format!("summary.requiredFields[{index}] must be a string"))
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.requiredFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_artifact_versioned_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let versioned_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("versionedFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| {
            "contract artifact must include summary.versionedFields array".to_string()
        })?;

    let actual_fields: Result<Vec<&str>, String> = versioned_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field
                .as_str()
                .ok_or_else(|| format!("summary.versionedFields[{index}] must be a string"))
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.versionedFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_artifact_non_negative_integer_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let non_negative_integer_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("nonNegativeIntegerFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| {
            "contract artifact must include summary.nonNegativeIntegerFields array".to_string()
        })?;

    let actual_fields: Result<Vec<&str>, String> = non_negative_integer_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field.as_str().ok_or_else(|| {
                format!("summary.nonNegativeIntegerFields[{index}] must be a string")
            })
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.nonNegativeIntegerFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_artifact_string_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let string_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("stringFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| "contract artifact must include summary.stringFields array".to_string())?;

    let actual_fields: Result<Vec<&str>, String> = string_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field
                .as_str()
                .ok_or_else(|| format!("summary.stringFields[{index}] must be a string"))
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.stringFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_artifact_array_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let array_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("arrayFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| "contract artifact must include summary.arrayFields array".to_string())?;

    let actual_fields: Result<Vec<&str>, String> = array_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field
                .as_str()
                .ok_or_else(|| format!("summary.arrayFields[{index}] must be a string"))
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.arrayFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_artifact_numeric_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let numeric_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("numericFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| "contract artifact must include summary.numericFields array".to_string())?;

    let actual_fields: Result<Vec<&str>, String> = numeric_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field
                .as_str()
                .ok_or_else(|| format!("summary.numericFields[{index}] must be a string"))
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.numericFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_artifact_nullable_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let nullable_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("nullableFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| "contract artifact must include summary.nullableFields array".to_string())?;

    let actual_fields: Result<Vec<&str>, String> = nullable_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field
                .as_str()
                .ok_or_else(|| format!("summary.nullableFields[{index}] must be a string"))
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.nullableFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_artifact_invalidatable_fields(
    relative_path: &str,
    expected_fields: &[&str],
) -> Result<(), String> {
    let artifact = load_json(relative_path);
    let invalidatable_fields = artifact
        .get("summary")
        .and_then(|summary| summary.get("invalidatableFields"))
        .and_then(Value::as_array)
        .ok_or_else(|| {
            "contract artifact must include summary.invalidatableFields array".to_string()
        })?;

    let actual_fields: Result<Vec<&str>, String> = invalidatable_fields
        .iter()
        .enumerate()
        .map(|(index, field)| {
            field
                .as_str()
                .ok_or_else(|| format!("summary.invalidatableFields[{index}] must be a string"))
        })
        .collect();
    let actual_fields = actual_fields?;

    if actual_fields.as_slice() == expected_fields {
        Ok(())
    } else {
        Err(format!(
            "contract artifact expected summary.invalidatableFields {expected_fields:?} but got {actual_fields:?}"
        ))
    }
}

pub fn verify_runtime_status_sample_manifest(relative_path: &str) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let samples = manifest
        .get("samples")
        .and_then(Value::as_array)
        .ok_or_else(|| "sample manifest must include a samples array".to_string())?;

    for sample in samples {
        let path = sample
            .get("path")
            .and_then(Value::as_str)
            .ok_or_else(|| "sample entry must include a string path".to_string())?;
        let expected_result = sample
            .get("expectedResult")
            .ok_or_else(|| format!("sample {path} must include expectedResult"))?;
        let actual_result = validation_result_json(validate_runtime_status_sample(path));

        if &actual_result != expected_result {
            return Err(format!(
                "sample {path} expected {expected_result} but got {actual_result}"
            ));
        }
    }

    Ok(())
}

pub fn verify_runtime_status_sample_manifest_kinds(
    relative_path: &str,
    expected_kinds: &[&str],
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let samples = manifest
        .get("samples")
        .and_then(Value::as_array)
        .ok_or_else(|| "sample manifest must include a samples array".to_string())?;

    let actual_kinds: Result<Vec<&str>, String> = samples
        .iter()
        .enumerate()
        .map(|(index, sample)| {
            sample
                .get("kind")
                .and_then(Value::as_str)
                .ok_or_else(|| format!("sample entry {index} must include a string kind"))
        })
        .collect();
    let actual_kinds = actual_kinds?;

    if actual_kinds.as_slice() == expected_kinds {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected sample kinds {expected_kinds:?} but got {actual_kinds:?}"
        ))
    }
}

pub fn verify_runtime_status_manifest_id(
    relative_path: &str,
    expected_artifact_id: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_artifact_id = manifest
        .get("artifactId")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string artifactId".to_string())?;

    if actual_artifact_id == expected_artifact_id {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected artifactId {expected_artifact_id} but got {actual_artifact_id}"
        ))
    }
}

pub fn verify_runtime_status_manifest_media_type(
    relative_path: &str,
    expected_media_type: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_media_type = manifest
        .get("mediaType")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string mediaType".to_string())?;

    if actual_media_type == expected_media_type {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected mediaType {expected_media_type} but got {actual_media_type}"
        ))
    }
}

pub fn verify_runtime_status_manifest_schema_version(
    relative_path: &str,
    expected_schema_version: u64,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_schema_version = manifest
        .get("schemaVersion")
        .and_then(Value::as_u64)
        .ok_or_else(|| "sample manifest must include an integer schemaVersion".to_string())?;

    if actual_schema_version == expected_schema_version {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected schemaVersion {expected_schema_version} but got {actual_schema_version}"
        ))
    }
}

pub fn verify_runtime_status_manifest_json_path(
    relative_path: &str,
    expected_json_path: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_json_path = manifest
        .get("artifactJsonPath")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string artifactJsonPath".to_string())?;

    if actual_json_path == expected_json_path {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected artifactJsonPath {expected_json_path} but got {actual_json_path}"
        ))
    }
}

pub fn verify_runtime_status_manifest_method(
    relative_path: &str,
    expected_method: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_method = manifest
        .get("contractMethod")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string contractMethod".to_string())?;

    if actual_method == expected_method {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractMethod {expected_method} but got {actual_method}"
        ))
    }
}

pub fn verify_runtime_status_manifest_artifact_id(
    relative_path: &str,
    expected_artifact_id: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_artifact_id = manifest
        .get("contractArtifactId")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string contractArtifactId".to_string())?;

    if actual_artifact_id == expected_artifact_id {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractArtifactId {expected_artifact_id} but got {actual_artifact_id}"
        ))
    }
}

pub fn verify_runtime_status_manifest_artifact_path(
    relative_path: &str,
    expected_artifact_path: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_artifact_path = manifest
        .get("contractArtifactPath")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string contractArtifactPath".to_string())?;

    if actual_artifact_path == expected_artifact_path {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractArtifactPath {expected_artifact_path} but got {actual_artifact_path}"
        ))
    }
}

pub fn verify_runtime_status_manifest_artifact_media_type(
    relative_path: &str,
    expected_media_type: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_media_type = manifest
        .get("contractArtifactMediaType")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "sample manifest must include a string contractArtifactMediaType".to_string()
        })?;

    if actual_media_type == expected_media_type {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractArtifactMediaType {expected_media_type} but got {actual_media_type}"
        ))
    }
}

pub fn verify_runtime_status_manifest_artifact_version(
    relative_path: &str,
    expected_artifact_version: u64,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_artifact_version = manifest
        .get("contractArtifactVersion")
        .and_then(Value::as_u64)
        .ok_or_else(|| {
            "sample manifest must include an integer contractArtifactVersion".to_string()
        })?;

    if actual_artifact_version == expected_artifact_version {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractArtifactVersion {expected_artifact_version} but got {actual_artifact_version}"
        ))
    }
}

pub fn verify_runtime_status_manifest_target_schema_version(
    relative_path: &str,
    expected_schema_version: u64,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_schema_version = manifest
        .get("contractSchemaVersion")
        .and_then(Value::as_u64)
        .ok_or_else(|| {
            "sample manifest must include an integer contractSchemaVersion".to_string()
        })?;

    if actual_schema_version == expected_schema_version {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractSchemaVersion {expected_schema_version} but got {actual_schema_version}"
        ))
    }
}

pub fn verify_runtime_status_manifest_json_schema_draft_uri(
    relative_path: &str,
    expected_draft_uri: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_draft_uri = manifest
        .get("contractJsonSchemaDraftUri")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "sample manifest must include a string contractJsonSchemaDraftUri".to_string()
        })?;

    if actual_draft_uri == expected_draft_uri {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractJsonSchemaDraftUri {expected_draft_uri} but got {actual_draft_uri}"
        ))
    }
}

pub fn verify_runtime_status_manifest_json_schema_id(
    relative_path: &str,
    expected_schema_id: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_schema_id = manifest
        .get("contractJsonSchemaId")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string contractJsonSchemaId".to_string())?;

    if actual_schema_id == expected_schema_id {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractJsonSchemaId {expected_schema_id} but got {actual_schema_id}"
        ))
    }
}

pub fn verify_runtime_status_manifest_json_schema_title(
    relative_path: &str,
    expected_schema_title: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_schema_title = manifest
        .get("contractJsonSchemaTitle")
        .and_then(Value::as_str)
        .ok_or_else(|| {
            "sample manifest must include a string contractJsonSchemaTitle".to_string()
        })?;

    if actual_schema_title == expected_schema_title {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractJsonSchemaTitle {expected_schema_title} but got {actual_schema_title}"
        ))
    }
}

pub fn verify_runtime_status_manifest_params_null(relative_path: &str) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let params = manifest
        .get("contractParams")
        .ok_or_else(|| "sample manifest must include contractParams".to_string())?;

    if params.is_null() {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractParams null but got {params}"
        ))
    }
}

pub fn verify_runtime_status_manifest_verification_command(
    relative_path: &str,
    expected_command: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_command = manifest
        .get("verificationCommand")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string verificationCommand".to_string())?;

    if actual_command == expected_command {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected verificationCommand {expected_command} but got {actual_command}"
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        REQUIRED_FIELDS, validate_runtime_status_sample,
        verify_runtime_status_artifact_array_fields,
        verify_runtime_status_artifact_invalidatable_fields,
        verify_runtime_status_artifact_non_negative_integer_fields,
        verify_runtime_status_artifact_nullable_fields,
        verify_runtime_status_artifact_numeric_fields,
        verify_runtime_status_artifact_required_fields,
        verify_runtime_status_artifact_string_fields,
        verify_runtime_status_artifact_versioned_fields,
        verify_runtime_status_manifest_artifact_id,
        verify_runtime_status_manifest_artifact_media_type,
        verify_runtime_status_manifest_artifact_path,
        verify_runtime_status_manifest_artifact_version, verify_runtime_status_manifest_id,
        verify_runtime_status_manifest_json_path,
        verify_runtime_status_manifest_json_schema_draft_uri,
        verify_runtime_status_manifest_json_schema_id,
        verify_runtime_status_manifest_json_schema_title,
        verify_runtime_status_manifest_media_type, verify_runtime_status_manifest_method,
        verify_runtime_status_manifest_params_null, verify_runtime_status_manifest_schema_version,
        verify_runtime_status_manifest_target_schema_version,
        verify_runtime_status_manifest_verification_command, verify_runtime_status_sample_manifest,
        verify_runtime_status_sample_manifest_kinds,
    };

    const VERSIONED_FIELDS: &[&str] = &[
        "runtimeProtocolVersion",
        "minCompatibleRuntimeClientVersion",
    ];
    const NON_NEGATIVE_INTEGER_FIELDS: &[&str] =
        &["rendererGraphEpoch", "liveTabCount", "liveLeafCount"];
    const STRING_FIELDS: &[&str] = &["runtimeId"];
    const ARRAY_FIELDS: &[&str] = &["capabilities"];
    const NUMERIC_FIELDS: &[&str] = &[
        "runtimeProtocolVersion",
        "minCompatibleRuntimeClientVersion",
        "rendererGraphEpoch",
        "liveTabCount",
        "liveLeafCount",
        "authoritativeWindowId",
    ];
    const NULLABLE_FIELDS: &[&str] = &["authoritativeWindowId"];
    const INVALIDATABLE_FIELDS: &[&str] = &[
        "runtimeProtocolVersion",
        "minCompatibleRuntimeClientVersion",
        "rendererGraphEpoch",
        "liveTabCount",
        "liveLeafCount",
        "capabilities",
        "graphStatus",
        "runtimeId",
        "authoritativeWindowId",
        "hostPlatform",
    ];

    #[test]
    fn accepts_the_checked_in_valid_runtime_status_sample() {
        assert_eq!(
            validate_runtime_status_sample("src/shared/runtime-status-contract-valid-sample.json"),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_required_fields() {
        assert_eq!(
            verify_runtime_status_artifact_required_fields(
                "src/shared/runtime-status-contract-artifact.json",
                REQUIRED_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_versioned_fields() {
        assert_eq!(
            verify_runtime_status_artifact_versioned_fields(
                "src/shared/runtime-status-contract-artifact.json",
                VERSIONED_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_non_negative_integer_fields() {
        assert_eq!(
            verify_runtime_status_artifact_non_negative_integer_fields(
                "src/shared/runtime-status-contract-artifact.json",
                NON_NEGATIVE_INTEGER_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_string_fields() {
        assert_eq!(
            verify_runtime_status_artifact_string_fields(
                "src/shared/runtime-status-contract-artifact.json",
                STRING_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_array_fields() {
        assert_eq!(
            verify_runtime_status_artifact_array_fields(
                "src/shared/runtime-status-contract-artifact.json",
                ARRAY_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_numeric_fields() {
        assert_eq!(
            verify_runtime_status_artifact_numeric_fields(
                "src/shared/runtime-status-contract-artifact.json",
                NUMERIC_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_nullable_fields() {
        assert_eq!(
            verify_runtime_status_artifact_nullable_fields(
                "src/shared/runtime-status-contract-artifact.json",
                NULLABLE_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_artifact_summary_invalidatable_fields() {
        assert_eq!(
            verify_runtime_status_artifact_invalidatable_fields(
                "src/shared/runtime-status-contract-artifact.json",
                INVALIDATABLE_FIELDS
            ),
            Ok(())
        );
    }

    #[test]
    fn rejects_the_checked_in_invalid_runtime_status_sample() {
        assert_eq!(
            validate_runtime_status_sample(
                "src/shared/runtime-status-contract-invalid-sample.json"
            ),
            Err(vec!["runtimeId"])
        );
    }

    #[test]
    fn verifies_every_sample_listed_in_the_checked_in_manifest() {
        assert_eq!(
            verify_runtime_status_sample_manifest(
                "src/shared/runtime-status-contract-samples.json"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_identifies_the_runtime_status_samples() {
        assert_eq!(
            verify_runtime_status_manifest_id(
                "src/shared/runtime-status-contract-samples.json",
                "janus-runtime-status-contract-samples"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_declares_the_runtime_status_samples_media_type() {
        assert_eq!(
            verify_runtime_status_manifest_media_type(
                "src/shared/runtime-status-contract-samples.json",
                "application/vnd.janus.runtime-status-contract-samples+json"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_schema_version() {
        assert_eq!(
            verify_runtime_status_manifest_schema_version(
                "src/shared/runtime-status-contract-samples.json",
                1
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_json_path() {
        assert_eq!(
            verify_runtime_status_manifest_json_path(
                "src/shared/runtime-status-contract-samples.json",
                "src/shared/runtime-status-contract-samples.json"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_status_get() {
        assert_eq!(
            verify_runtime_status_manifest_method(
                "src/shared/runtime-status-contract-samples.json",
                "status.get"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_null_status_get_params() {
        assert_eq!(
            verify_runtime_status_manifest_params_null(
                "src/shared/runtime-status-contract-samples.json"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_runtime_status_sample_verification_command() {
        assert_eq!(
            verify_runtime_status_manifest_verification_command(
                "src/shared/runtime-status-contract-samples.json",
                "pnpm run verify:runtime-status-samples"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_runtime_status_sample_kinds() {
        assert_eq!(
            verify_runtime_status_sample_manifest_kinds(
                "src/shared/runtime-status-contract-samples.json",
                &["valid", "invalid"]
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_contract_artifact() {
        assert_eq!(
            verify_runtime_status_manifest_artifact_id(
                "src/shared/runtime-status-contract-samples.json",
                "janus-runtime-status-contract"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_contract_artifact_path() {
        assert_eq!(
            verify_runtime_status_manifest_artifact_path(
                "src/shared/runtime-status-contract-samples.json",
                "src/shared/runtime-status-contract-artifact.json"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_contract_artifact_media_type() {
        assert_eq!(
            verify_runtime_status_manifest_artifact_media_type(
                "src/shared/runtime-status-contract-samples.json",
                "application/vnd.janus.runtime-status-contract+json"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_contract_artifact_version() {
        assert_eq!(
            verify_runtime_status_manifest_artifact_version(
                "src/shared/runtime-status-contract-samples.json",
                1
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_contract_schema_version() {
        assert_eq!(
            verify_runtime_status_manifest_target_schema_version(
                "src/shared/runtime-status-contract-samples.json",
                1
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_json_schema_draft() {
        assert_eq!(
            verify_runtime_status_manifest_json_schema_draft_uri(
                "src/shared/runtime-status-contract-samples.json",
                "https://json-schema.org/draft/2020-12/schema"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_json_schema_id() {
        assert_eq!(
            verify_runtime_status_manifest_json_schema_id(
                "src/shared/runtime-status-contract-samples.json",
                "urn:janus:runtime-status-contract:json-schema:1"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_json_schema_title() {
        assert_eq!(
            verify_runtime_status_manifest_json_schema_title(
                "src/shared/runtime-status-contract-samples.json",
                "Janus Runtime status.get result"
            ),
            Ok(())
        );
    }
}
