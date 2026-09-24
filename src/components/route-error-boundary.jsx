import React from "react";

export default class RouteErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, details) {
    console.error("Admin page failed to render", error, details);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return <div className="grid min-h-[70vh] place-items-center p-4">
      <div role="alert" className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-black text-slate-900">This page could not be displayed</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">The Admin panel stayed available. Try opening the page again or return to the dashboard.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => this.setState({ error: null })} className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white">Try again</button>
          <a href="/dashboard" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">Dashboard</a>
        </div>
      </div>
    </div>;
  }
}
