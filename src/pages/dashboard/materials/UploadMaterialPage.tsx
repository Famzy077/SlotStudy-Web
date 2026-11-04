import { useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight, CheckCircle2, CloudUpload, FileText, LoaderCircle,
} from 'lucide-react';
import api, { getErrorMessage, unwrap } from '../../../lib/api';
import type { Course, Material } from '../../../types';
import { list, useApiQuery } from '../../../hooks/useApiQuery';
import { PageTitle } from '../../../components/common';

export function UploadMaterialPage() {
  const [params] = useSearchParams();
  const queryClient = useQueryClient();
  const coursesQuery = useApiQuery<unknown>('courses', '/courses');
  const courses = list<Course>(coursesQuery.data, 'courses');

  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState(params.get('courseId') || '');
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    if (courseId) body.append('courseId', courseId);
    setBusy(true);
    setError('');
    setSuccess('');
    setProgress(0);
    try {
      const { data } = await api.post('/materials/upload', body, {
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });
      const material = unwrap<Material>(data);
      if (material.id) {
        try {
          await api.post(`/materials/${material.id}/process`);
        } catch (processingError) {
          setError(
            `Uploaded successfully, but processing could not start: ${getErrorMessage(
              processingError,
            )}`,
          );
        }
      }
      setSuccess(`“${file.name}” uploaded. You can follow processing in AI summaries.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['materials'] }),
        queryClient.invalidateQueries({ queryKey: ['courses'] }),
      ]);
      setFile(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  function choose(candidate?: File) {
    if (!candidate) return;
    if (!/\.(pdf|png|jpe?g)$/i.test(candidate.name)) {
      setError('Choose a PDF, PNG or JPG file.');
      return;
    }
    if (candidate.size > 50 * 1024 * 1024) {
      setError('This file is larger than the 50 MB limit.');
      return;
    }
    setError('');
    setFile(candidate);
  }

  return (
    <div className="narrow-page">
      <PageTitle
        eyebrow="ADD TO YOUR STUDY SPACE"
        title="Upload material"
        subtitle="Add notes, handouts or lecture slides. We’ll help you turn them into something easier to study."
      />
      <div className="upload-card">
        <form onSubmit={upload}>
          <button
            type="button"
            className={`dropzone ${file ? 'dropzone-selected' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              choose(event.dataTransfer.files[0]);
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              hidden
              onChange={(event) => choose(event.target.files?.[0])}
            />
            {file ? (
              <>
                <span className="dropzone-icon">
                  <FileText size={24} />
                </span>
                <b>{file.name}</b>
                <span>
                  {(file.size / 1024 / 1024).toFixed(1)} MB · Ready to upload
                </span>
                <span className="replace-file">Click to choose a different file</span>
              </>
            ) : (
              <>
                <span className="dropzone-icon">
                  <CloudUpload size={25} />
                </span>
                <b>Drop your file here, or <u>browse</u></b>
                <span>PDF, PNG or JPG · Up to 50 MB</span>
              </>
            )}
          </button>
          <label className="form-field course-select">
            <span>
              Add to a course <small>Optional</small>
            </span>
            <select
              className="select-input"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
            >
              <option value="">No course selected</option>
              {courses.map((course) => (
                <option value={course.id} key={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
          {busy && (
            <div className="upload-progress">
              <div className="progress-label">
                <span>Uploading material</span>
                <b>{progress}%</b>
              </div>
              <div className="progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {error && <div className="form-alert">{error}</div>}
          {success && (
            <div className="success-alert">
              <CheckCircle2 size={17} />
              {success}
            </div>
          )}
          <button
            className="button button-primary upload-submit"
            disabled={!file || busy}
          >
            {busy ? 'Uploading…' : 'Upload and process'}
            {busy ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
          </button>
        </form>
      </div>
      <div className="upload-privacy">
        <span>✦</span>
        <div>
          <b>Your notes stay yours.</b>
          <p>
            Materials are only used to support your own study sessions and summaries.
          </p>
        </div>
      </div>
    </div>
  );
}
